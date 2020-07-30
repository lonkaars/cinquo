import { settingsCollection, header, button, label, input, toggle, delayedSave, jsonprop, config } from '../../settings';
import * as $ from "jquery";
import { Terminal } from "xterm";
import * as electron from "electron";
import { FitAddon } from "xterm-addon-fit";

class serverConsole {
	id: string;
	$: JQuery;
	fitAddon: FitAddon;
	term: Terminal;
	html: string;

	constructor() {
		this.id = "console";
		this.$ = $('<div></div>')
		.attr('id', this.id);
		this.fitAddon = new FitAddon();
		this.term = new Terminal({
			rows: 24,
			fontFamily: 'Fira Code, consolas, monospace'
		});
		this.term.loadAddon(this.fitAddon);
		electron.ipcRenderer.on('serverMessage', (event, data) => this.term.write(data));
		electron.ipcRenderer.on('previousServerLogs', (event, data) => this.term.write(data.join('')));

		electron.ipcRenderer.send('serverReady');

		this.html = this.$[0].outerHTML;
	}

	run() {
		this.term.open($('#console')[0]);
		this.fitAddon.fit();

		var getProp = (varname: string) => getComputedStyle(document.documentElement).getPropertyValue(varname).trim();
		this.term.setOption('theme', {
			background: getProp('--shade1'),
			black: getProp('--shade2'),
			blue: getProp('--accent5'),
			brightBlack: getProp('--shade3'),
			brightBlue: getProp('--accent5'),
			brightCyan: getProp('--accent4'),
			brightGreen: getProp('--accent3'),
			brightMagenta: getProp('--accent7'),
			brightRed: getProp('--accent0'),
			brightWhite: getProp('--shade7'),
			brightYellow: getProp('--accent2'),
			cursor: getProp('--shade1'),
			cursorAccent: getProp('--shade7'),
			cyan: getProp('--accent4'),
			foreground: getProp('--shade7'),
			green: getProp('--accent3'),
			magenta: getProp('--accent7'),
			red: getProp('--accent0'),
			selection: "#0000",
			white: getProp('--shade6'),
			yellow: getProp('--accent2')
		});

		$(window).on('resize', () => this.fitAddon.fit());
	}
}

var page = new settingsCollection([
	new header("Server settings"),

	new label("Launch at startup"),
	new toggle(new jsonprop('launchAtStartup')),

	new label("Start minimized"),
	new toggle(new jsonprop('startMinimized')),

	new label("Server port"),
	new input(config.serverPort, n => {
		config.serverPort = n;
		delayedSave(1000);
	}, 'number'),

	new label("Restart server"),
	new button("Restart", () => electron.ipcRenderer.send('serverRestart')),

	new label("Server console"),
	new serverConsole()
])

module.exports = {
	name: "Server settings",
	page,
	id: "server",
	position: 2,
	accentColor: "var(--accent6)"
}
