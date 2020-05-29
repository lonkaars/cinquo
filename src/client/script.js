var socketNoGD = io(`${location.protocol}\/\/${location.hostname}:${location.port.trim() != "" ? `${location.port}` : '80'}`);
var socket = new SocketGD(socketNoGD);

var lastData = "";

var notificationQueue = [];
var notifying = false;
var currentNotification = 0;

socket.on('connect', function() {
	notify("Connected to server!", "#29c23d")
	socket.emit('ready')
});

var prefrences = {};
socket.on('prefrences', (data, ack, msgID) => {
	prefrences = data

	if(prefrences.blurFx) $('.currentApp').addClass('blurFx');

	ack()
})

$(document).ready(() => {
	$('.select').on('click', function(e) {
		$(this).toggleClass('closed')
		e.preventDefault();
	})

	$('.select .options .option').on('click', function(e) {
		$(this).closest('.select').find('i.label').text($(this).text())
		e.preventDefault();
	})

	nosleep = new NoSleep();
	nosleep.enable();

	gridSize('.panels')
	$(window).on('resize', () => {
		gridSize('.panels')
	})


	/* var editor = ace.edit('jsonEditor');
	editor.setTheme('ace/theme/merbivore_soft');
	editor.session.setMode('ace/mode/json');

	var gp = new Grapick({
	    el: "#gp"
	});

	gp.addHandler(0, '#f00');
	gp.addHandler(100, '#ff0');

	gp.on('change', complete => {
	    document.body.style.background = gp.getSafeValue();
	}) */
})

socket.on('toast', (data, ack) => {
	notify(...data)
	ack()
})
socket.on('reload', (data, ack) => {
	ack()
	location.reload()
})

socket.on('currentAppTitle', (data, ack, msgID) => {
	$('.appName').text(data)
	ack()
})

socket.on('currentApp', function(data, ack, msgID) {
	var data = JSON.parse(data)
	$('.procName').text(data.procName)
	$('.currentApp .icon').css({
		'background': `url(${data.icon})`,
		"background-size": "cover"
	})
	ack()
});


socket.on('eval', (data, ack, msgID) => {
	eval(data)
	ack()
})

socket.on('tilesNoAnimation', (data, ack, msgID) => {
	$('#panel2').html(data)
	ack()
})

socket.on('tiles', (data, ack, msgID) => {
	// catch delayed ack
	if (data == lastData) {
		ack()
		return
	};
	lastData = data;

	$('#panel1').html(data)
	if (data.trim() == '') {
		$('#panel1').html(`<div class="panel empty" style="background: #0000; grid-column: 5/13; grid-row: 2/5;"><h1>Empty palette</h1></div>`)
	}

	anime({
		targets: '#panel1',
		scale: [0.9, 1],
		opacity: [0, 1],
		filter: prefrences.blurFx ? ["blur(20px)", "blur(0px)"] : undefined,
		duration: 500,
		easing: 'easeOutQuad',
		begin: anim => {
			$('.panels').css({
				'pointer-events': 'none',
				'position': 'absolute'
			})
		},
		complete: anim => {
			$('#panel2').html($('#panel1').html())
			$('#panel1').html('');
			$('.panels').css('pointer-events', 'auto');
		}
	})
	anime({
		targets: '#panel2',
		scale: [1, 2],
		opacity: [1, 0],
		filter: prefrences.blurFx ? ["blur(0px)", "blur(20px)"] : undefined,
		duration: 500,
		easing: 'easeInQuad',
		complete: anim => {
			$('#panel2')
				.css({
					transform: 'none',
					opacity: '1',
					filter: 'none',
					position: 'static'
				});
		}
	})

	ack()
})

socket.on('disconnect', function() {
	notify('Lost connection to server', "#444")
});

function slider(el) {
	$(`p${el}`).text(Math.floor(Number($(`input${el}`).val())))
	socket.emit('tile', {
		el,
		type: 'slider',
		val: $(el).val()
	})
}

function button(el) {
	socket.emit('tile', {
		el,
		type: 'button'
	})
}

function hslToHex(h, s, l) {
	h /= 360;
	s /= 100;
	l /= 100;
	let r, g, b;
	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	const toHex = x => {
		const hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function gridSize(e) {
	$(e).each(function() {
		var el = $(this),
			width = el.outerWidth(),
			gridSize = Number(el.css('--grid-size')),
			gridGutter = Number(el.css('--grid-gutter').match(/\d+/)[0])

		el.css('grid-auto-rows', `${(width-(gridGutter*(gridSize-1)))/gridSize}px`)
	})
}

function notify(message, color) {
	notificationQueue.push({
		message,
		color
	})
	if (!notifying) startNotificationQueue();
}

function startNotificationQueue() {
	notifying = true;
	if (!notificationQueue[currentNotification]) {
		notifying = false;
		currentNotification = 0;
		notificationQueue = [];
		return;
	};
	var notification = notificationQueue[currentNotification];
	document.documentElement.style.setProperty('--toast-color', notification.color);

	if (currentNotification == 0) {
		$('.currentApp .toast:not(.alt)').text(notification.message)
		$('.currentApp').addClass('toasting')
	}

	if (currentNotification <= notificationQueue.length - 1 && currentNotification != 0) {
		$('.currentApp .toast.alt').text(notification.message);
		anime({
			targets: '.currentApp .toast:not(.alt)',
			duration: 300,
			top: ['50%', '-10%'],
			easing: 'easeInOutQuad'
		})
		anime({
			targets: '.currentApp .toast.alt',
			duration: 300,
			top: ['110%', '50%'],
			easing: 'easeInOutQuad',
			complete: () => {
				$('.currentApp .toast:not(.alt)').text($('.currentApp .toast.alt').text());
				$('.currentApp .toast.alt').text("");
				$('.currentApp .toast').attr('style', '');
			}
		})
	}

	setTimeout(() => {
		if (currentNotification == notificationQueue.length - 1) $('.currentApp').removeClass('toasting')

		currentNotification++;
		startNotificationQueue();
	}, 3000)
}
