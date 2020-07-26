var express = require('express'),
	expressApp = express(),
	path = require('path'),
	server = require('http').createServer(expressApp),
	io = require('socket.io')(server),
	processMetadata = require(__dirname + '/processMetadata.js'),
	util = require('util'),
	makeTiles = require(__dirname + '/generateTiles').generateTiles,
	config = require(__dirname + '/user/config.json'),
	actions = require(__dirname + '/actions.js'),
	SocketGD = require('socketgd').SocketGD,
	socketgd = new SocketGD(),
	fs = require('fs'),
	readfile = util.promisify(fs.readFile),
	mkdir = util.promisify(fs.mkdir),
	writefile = util.promisify(fs.writeFile),
	allApps = fs.readdirSync(__dirname + '/user/palettes'),
	c = require('chalk'),
	chalk = new c.Instance({ level: 1 }),
	tiles = [],
	oldProcess: any = {};

// debugging server outside electron
if(typeof process.send == "undefined")
	process.send = console.log;

Array.prototype["isIn"] = function(item: string) {
	var returnVal = false
	this.forEach((i: string) => {
		if (i.toLowerCase().includes(item.toLowerCase()))
			returnVal = true;
	});
	return returnVal;
}

async function sendData(client: any) {
	var currentProcess: any = await processMetadata.getCurrentProcess(oldProcess);

	// Only send window title if it changed
	if (oldProcess.title != currentProcess.title)
		client.emit('currentAppTitle', currentProcess.title);

	if (currentProcess.noWin)
		client.emit('currentApp', '{"icon": "none", "procName": ""}');

	// Send process name and icon if it changed
	if (oldProcess.executable != currentProcess.executable && currentProcess.noWin == false) {
		var appPath: string = path.join(__dirname, "/user/palettes", currentProcess.name);
		var alwaysPalette = allApps.includes(config.alwaysPalette);
		var tilesPath = alwaysPalette
			? path.join(__dirname, "/user/palettes", config.alwaysPalette, '/palette.json')
			: path.join(appPath, '/palette.json');
		tiles = JSON.parse(await readfile(tilesPath));
		client.emit(!alwaysPalette ? 'tiles' : 'tilesNoAnimation', makeTiles(tiles, config));

		client.emit('currentApp', JSON.stringify({
			icon: currentProcess.icon.formatted,
			procName: currentProcess.name
		}));
	}

	oldProcess = currentProcess;
}

io.on('connection', async (socket: any) => {
	process.send(chalk.yellow(chalk.bold('Connection from ')) + chalk.magenta(socket.handshake.address));

	socketgd.setSocket(socket);

	socketgd.emit('prefrences', config);

	// Event listeners
	socketgd.on('ready', async () => {
		await sendData(socketgd);
		setInterval(async () => {
			await sendData(socketgd);
		}, 500);
	});

	socketgd.on('tile', (data: any, ack: any) => {
		actions.action(tiles.find(i => i.id == data.el.match(/\d+/)), data);
		ack();
	});

	socketgd.on('type', (data: any, ack: any) => {
		require('robotjs').typeString(data);
		ack();
	});
});


expressApp.use(express.static(path.join(__dirname, '/..')));
expressApp.all("/", (request: any, response: any) => {
	response.sendFile(path.join(__dirname, '/../client/index.html'));
});

var errorcatch = (err: Error) => process.send(chalk.red(err.stack.replace(/\n/g, '\n\r')))
process.on('uncaughtException', (err: Error) => errorcatch(err));
process.on('warning', (err: Error) => errorcatch(err));
process.on('unhandledRejection', (err: Error) => errorcatch(err));

server.on('listening', () => process.send(chalk.blue(chalk.bold(`Server started on *:${config.serverPort}`))));
server.listen(config.serverPort);

