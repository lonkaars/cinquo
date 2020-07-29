import { settingsCollection, header, button, label, input, toggle, delayedSave, jsonprop, config } from '../../settings';
import * as $ from "jquery";

class serverConsole {
	constructor() {
		this.id = "console";
		this.$ = $('<div></div>')
			.attr('id', this.id);
		this.html = this.$[0].outerHTML;
	}

	run() {
		term.open($('#console')[0]);
		fitAddon.fit()
		updateTermTheme()

		$(window).on('resize', () => {
			fitAddon.fit()
		})
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
	new button("Restart", () => {
		electron.ipcRenderer.send('serverRestart');
	}),

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
