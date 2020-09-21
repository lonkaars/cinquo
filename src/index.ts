import {app, BrowserWindow, ipcMain, Tray, Menu} from "electron";
import * as autolaunch from "auto-launch";
import * as chalk from "chalk";
import * as cp from "child_process";
import * as path from "path";

var confg = require(__dirname + '/server/user/config.json'),
	startup = new autolaunch({
	name: 'Cinquo',
	path: `${__dirname}/cinquo.vbs`
});

if (confg.electronReload)
	require('electron-reload')(__dirname);

startup[confg.launchAtStartup ? 'enable' : 'disable']();

let win: BrowserWindow, tray: Tray;

function createWindow() {
	win = new BrowserWindow({
		width: 1020,
		height: 700,
		webPreferences: {
			nodeIntegration: true
		},
		backgroundColor: "#000",
		frame: false,
		resizable: confg.windowResizable,
		icon: path.join(__dirname + '/icons/icon@256.png')
	});

	if (confg.devToolsOnStart)
		win.webContents.openDevTools();
	if (!confg.defaultShortcuts)
		win.setMenu(null);

	win.loadFile('main.html');
	win.on('closed', () => win = null);
}

app.on('ready', () => {
	createTray()
	if (!confg.startMinimized)
		createWindow();
})

app.on('window-all-closed', (e: Event) => e.preventDefault())

ipcMain.on('quit', () => {
	app.quit()
})

app.on('activate', () => {
	if (win === null)
		createWindow();
});

function createTray() {
	tray = new Tray(path.join(__dirname + '/icons/icon@256.png'))
	var contextMenu = Menu.buildFromTemplate([
		{
			label: 'Show App',
			click: () => win ? win.show() : createWindow()
		},
		{
			label: 'Quit',
			click: () => app.quit()
		}
	]);
	tray.setContextMenu(contextMenu);
	tray.setToolTip('Cinquo Daemon');
	tray.on('click', () => win ? win.show() : createWindow());
}


// server
var server: cp.ChildProcess;
var serverOutput = [];
function newServer() {
	server = cp.fork(__dirname + '/server/index.js', [], { silent: true, stdio: 'pipe' });
	server.on('message', (data: string) => {
		var formatted = formatTermData(data);
		if (win) win.webContents.send('serverMessage', formatted);
		serverOutput.push(formatted);
	})
}

ipcMain.on('serverLogsPls', () => win.webContents.send('previousServerLogs', serverOutput));
ipcMain.on('serverReady', () => (!server && newServer()))
ipcMain.on('serverRestart', () => {
	server.kill();
	var delmsg: string = formatTermData(chalk.gray(chalk.bold("Server process killed")));
	if (win) win.webContents.send('serverMessage', delmsg);
	serverOutput.push(delmsg);
	newServer();
})

function formatTermData(data: string) {
	return `${chalk.gray(`[${new Date().toLocaleTimeString('nl')}] `)}${data}\n\r`
}

