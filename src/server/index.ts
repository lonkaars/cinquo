require('source-map-support').install();

import * as express from "express";
import * as path from "path"
import { SocketGD } from "socketgd";
import * as processMetadata from "./processMetadata"
import * as actions from "./actions";
import * as palettes from "./palettes";
import { generateTiles } from "./generateTiles";
import * as c from "chalk";
import { dark } from "../settings";

palettes.load();

var expressApp = express(),
	server = require('http').createServer(expressApp),
	io = require('socket.io')(server),
	config = require(__dirname + '/user/config.json'),
	socketgd = new SocketGD(),
	chalk = new c.Instance({ level: 1 }),
	tiles = <Array<any>> [],
	oldProcess: any = {};

// debugging server outside electron
if(typeof process.send == "undefined")
	process.send = console.log;

async function sendData(client: any) {
	var currentProcess: processMetadata.process = await processMetadata.getCurrentProcess();

	// Only send window title if it changed
	if (oldProcess.title != currentProcess.title)
		client.emit('currentAppTitle', currentProcess.title);

	// Send process name and icon if it changed
	if (oldProcess.executable != currentProcess.executable) {
		let paletteName: string = config.alwaysPalette ? config.alwaysPalette : currentProcess.name;
		let palette: palettes.palette = palettes.findByName(paletteName);

		if(!palette) {
			let icon: palettes.paletteIcon = await processMetadata.getIcon(currentProcess.iconPath);
			palette = await palettes.create(currentProcess.name, icon);
		}

		tiles = palette.palette;
		client.emit('tiles', generateTiles(palette.palette, palette.config));
		client.emit('currentApp', JSON.stringify({
			icon: palette.icon.formatted,
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

	// test this
	socketgd.on('tile', (data: any, ack: any) => {
		actions.action(tiles.find(i => i.id == data.el.match(/\d+/)), data);
		ack();
	});
});

expressApp.use(express.static(path.join(__dirname, '/..')));
expressApp.all("/", (request: express.request, response: express.response) => {
	response.sendFile(path.join(__dirname, '/../client/index.html'));
});
expressApp.all("/client/round.png", (request: express.request, response: express.response) => {
	response.sendFile(path.join(__dirname, `/../icons/iconround-${dark ? 'dark' : 'light'}@256.png`));
})
expressApp.all("/client/square.png", (request: express.request, response: express.response) => {
	response.sendFile(path.join(__dirname, `/../icons/icon-${dark ? 'dark' : 'light'}@256.png`));
})

var errorcatch = (err: Error) => process.send(chalk.red(err.stack.replace(/\n/g, '\n\r')))
process.on('uncaughtException', (err: Error) => errorcatch(err));
process.on('warning', (err: Error) => errorcatch(err));
process.on('unhandledRejection', (err: Error) => errorcatch(err));

server.on('listening', () => process.send(chalk.blue(chalk.bold(`Server started on *:${config.serverPort}`))));
server.listen(config.serverPort);

