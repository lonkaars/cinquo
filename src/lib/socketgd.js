(function(exporter) {

  /**
   * socket.io guaranteed delivery socket wrapper.
   * if the socket gets disconnected at any point, it's up to the application to set a new socket to continue
   * handling messages.
   * calling 'setSocket' causes all messages that have not received an ack to be sent again.
   * @constructor
   */
  function SocketGD(socket, lastAcked) {
    this._pending = [];
    this._events = {};
    this._id = 0;
    this._enabled = true;
    this._onAckCB = SocketGD.prototype._onAck.bind(this);
    this._onReconnectCB = SocketGD.prototype._onReconnect.bind(this);
    this.setLastAcked(lastAcked);
    this.setSocket(socket);
  }

  /**
   * set the id
   * @param id
   */
  SocketGD.prototype.setId = function (id) {
      this._id = id >= 0 ? id : 0;
  };

  /**
   * return the id
   */
  SocketGD.prototype.id = function () {
      return this._id;
  };

  /**
   * set the last message id that an ack was sent for
   * @param lastAcked
   */
  SocketGD.prototype.setLastAcked = function(lastAcked) {
    this._lastAcked = lastAcked >= 0 ? lastAcked : -1;
  };

  /**
   * get the last acked message id
   */
  SocketGD.prototype.lastAcked = function() {
    return this._lastAcked;
  };

  /**
   * replace the underlying socket.io socket with a new socket. useful in case of a socket getting
   * disconnected and a new socket is used to continue with the communications
   * @param socket
   */
  SocketGD.prototype.setSocket = function(socket) {

    this._cleanup();
    this._socket = socket;

    if (this._socket) {
      this._socket.on('reconnect', this._onReconnectCB);
      this._socket.on('socketgd_ack', this._onAckCB);

      this.sendPending();
    }
  };

  /**
   * send all pending messages that have not received an ack
   */
  SocketGD.prototype.sendPending = function() {
    var _this = this;
    // send all pending messages that haven't been acked yet
    this._pending.forEach(function(message) {
      _this._sendOnSocket(message);
    });
  };

  /**
   * clear out any pending messages
   */
  SocketGD.prototype.clearPending = function() {
    this._pending = [];
  };

  /**
   * enable or disable sending message with gd. if disabled, then messages will be sent without guaranteeing delivery
   * in case of socket disconnection/reconnection.
   */
  SocketGD.prototype.enable = function(enabled) {
    this._enabled = enabled;
  };

  /**
   * get the underlying socket
   */
  SocketGD.prototype.socket = function() {
    return this._socket;
  };

  /**
   * cleanup socket stuff
   * @private
   */
  SocketGD.prototype._cleanup = function() {
    if (!this._socket) {
      return;
    }

    this._socket.removeListener('reconnect', this._onReconnectCB);
    this._socket.removeListener('socketgd_ack', this._onAckCB);
  };

  /**
   * invoked when an ack arrives
   * @param ack
   * @private
   */
  SocketGD.prototype._onAck = function(ack) {
    // got an ack for a message, remove all messages pending an ack up to (and including) the acked message.
    while (this._pending.length > 0 && this._pending[0].id <= ack.id) {
      if (this._pending[0].id === ack.id && this._pending[0].ack) {
        this._pending[0].ack.call(null, ack.data);
      }
      this._pending.shift();
    }
  };

  /**
   * invoked when an a reconnect event occurs on the underlying socket
   * @private
   */
  SocketGD.prototype._onReconnect = function() {
    this.sendPending();
  };

  /**
   * send an ack for a message
   * @private
   */
  SocketGD.prototype._sendAck = function(id, data) {
    if (!this._socket) {
      return;
    }

    this._lastAcked = id;
    this._socket.emit('socketgd_ack', {id: id, data: data});
    return this._lastAcked;
  };

  /**
   * send a message on the underlying socket.io socket
   * @param message
   * @private
   */
  SocketGD.prototype._sendOnSocket = function(message) {
    if (this._enabled && message.id === undefined) {
      message.id = this._id++;
      message.gd = true;
      this._pending.push(message);
    }

    if (!this._socket) {
      return;
    }

    if (this._enabled) {
      switch (message.type) {
        case 'send':
          this._socket.send('socketgd:' + message.id + ':' + message.msg);
          break;
        case 'emit':
          this._socket.emit(message.event, {socketgd: message.id, msg: message.msg});
          break;
      }
    } else {
      switch (message.type) {
        case 'send':
          this._socket.send(message.msg, message.ack);
          break;
        case 'emit':
          this._socket.emit(message.event, message.msg, message.ack);
          break;
      }
    }
  };

  /**
   * send a message with gd. this means that if an ack is not received and a new connection is established (by
   * calling setSocket), the message will be sent again.
   * @param message
   * @param ack
   */
  SocketGD.prototype.send = function(message, ack) {
    this._sendOnSocket({type: 'send', msg: message, ack: ack});
  };

  /**
   * emit an event with gd. this means that if an ack is not received and a new connection is established (by
   * calling setSocket), the event will be emitted again.
   * @param event
   * @param message
   * @param ack
   */
  SocketGD.prototype.emit = function(event, message, ack) {
    this._sendOnSocket({type: 'emit', event: event, msg: message, ack: ack});
  };

  /**
   * disconnect the socket
   */
  SocketGD.prototype.disconnect = function(close) {
    this._socket && this._socket.disconnect(close);
    this._cleanup();
    this._socket = null;
  };

  /**
   * disconnectSync the socket
   */
  SocketGD.prototype.disconnectSync = function() {
    this._socket && this._socket.disconnectSync();
    this._cleanup();
    this._socket = null;
  };

  /**
   * close the socket
   */
  SocketGD.prototype.close = function() {
    this._socket && this._socket.disconnect(true);
    this._cleanup();
    this._socket = null;
  };

  /**
   * listen for events on the socket. this replaces calling the 'on' method directly on the socket.io socket.
   * here we take care of acking messages.
   * @param event
   * @param cb
   */
  SocketGD.prototype.on = function(event, cb) {
    this._events[event] = this._events[event] || [];

    var _this = this;
    var cbData = {
      cb: cb,
      wrapped: function(data, ack) {
        if (data && event === 'message') {
          // parse the message
          if (data.indexOf('socketgd:') !== 0) {
            cb(data, ack);
            return;
          }
          // get the id (skipping the socketgd prefix)
          var index = data.indexOf(':', 9);
          if (index === -1) {
            cb(data, ack);
            return;
          }

          var id = parseInt(data.substring(9, index));
          if (id <= _this._lastAcked) {
            // discard the message since it was already handled and acked
            return;
          }

          var message = data.substring(index + 1);
          // the callback must call the 'ack' function so we can send an ack for the message
          cb && cb(message, function(ackData) {
            return _this._sendAck(id, ackData);
          }, id);
        } else if (data && typeof data === 'object' && data.socketgd !== undefined) {
          if (data.socketgd <= _this._lastAcked) {
            // discard the message since it was already handled and acked
            return;
          }
          cb && cb(data.msg, function(ackData) {
            return _this._sendAck(data.socketgd, ackData);
          }, data.socketgd);
        } else {
          cb(data, ack);
        }
      }
    };

    this._events[event].push(cbData);

    this._socket.on(event, cbData.wrapped);
  };

  /**
   * remove a previously set callback for the specified event
   */
  SocketGD.prototype.off =
      SocketGD.prototype.removeListener = function(event, cb) {
        if (!this._events[event]) {
          return;
        }

        // find the callback to remove
        for (var i = 0; i < this._events[event].length; ++i) {
          if (this._events[event][i].cb === cb) {
            this._socket && this._socket.removeListener(event, this._events[event][i].wrapped);
            this._events[event].splice(i, 1);
          }
        }
      };

  exporter.SocketGD = SocketGD;

})(typeof module !== 'undefined' && typeof module.exports === 'object' ? module.exports : window);
