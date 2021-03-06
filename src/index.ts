const {
	app,
	BrowserWindow,
	remote,
	ipcMain,
	Tray,
	Menu
} = require('electron')
var confg = require(__dirname + '/server/user/config.json'),
	autolaunch = require('auto-launch'),
	startup = new autolaunch({
	name: 'Cinquo',
	path: `${__dirname}/cinquo.vbs`
});

if (confg.electronReload)
	require('electron-reload')(__dirname);

startup[confg.launchAtStartup ? 'enable' : 'disable']();

// server
var cp = require('child_process');
var server = cp.fork(__dirname + '/server/index.js', [], {
	silent: true
});
var serverOutput = [];
var chalk = require('chalk');


let win, tray;

function createWindow() {
	win = new BrowserWindow({
		width: 867,
		height: 584,
		webPreferences: {
			nodeIntegration: true
		},
		backgroundColor: "#000",
		frame: false,
		resizable: false,
		icon: __dirname + "/icon.png"
	});

	if (confg.devToolsOnStart)
		win.webContents.openDevTools();
	if (!confg.defaultShortcuts)
		win.setMenu(null);

	win.loadFile('main.html');
	win.on('closed', () => win = null);
	win.webContents.on('dom-ready', () => win.webContents.send('previousServerLogs', serverOutput));
}

app.on('ready', () => {
	createTray()
	if (!confg.startMinimized)
		createWindow();
})

app.on('window-all-closed', e => e.preventDefault())

ipcMain.on('quit', () => {
	app.quit()
})

app.on('activate', () => {
	if (win === null)
		createWindow();
});

function createTray() {
	tray = new Tray(__dirname + '/icon.png')
	var contextMenu = Menu.buildFromTemplate([{
		label: 'Show App',
		click: function () {
			win ? win.show() : createWindow()
		}
	},
	{
		label: 'Quit',
		click: function () {
			app.isQuiting = true;
			app.quit();
		}
	}
	]);
	tray.setContextMenu(contextMenu);
	tray.setToolTip('Cinquo Daemon');
	tray.on('click', () => win ? win.show() : createWindow());
}


// server
server.on('message', data => {
	var formatted = formatTermData(data);

	if (win)
		win.webContents.send('serverMessage', formatted);
	serverOutput.push(formatted);
})

ipcMain.on('serverRestart', () => {
	server.kill();
	server = cp.fork(__dirname + '/server/index.js', {stdio: 'pipe'});
	server.on('message', data => {
		var formatted = formatTermData(data);

		if (win)
			win.webContents.send('serverMessage', formatted);
		serverOutput.push(formatted);
	})
})

function formatTermData(data) {
	return `${chalk.gray(`[${new Date().toLocaleTimeString('nl')}] `)}${data}\n\r`
}

