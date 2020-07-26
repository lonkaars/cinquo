var {
	settingsCollection,
	header,
	button,
	label,
	toggle,
	jsonprop
} = require(__dirname + '/../../settings.js'),
	locale = require(__dirname + '/../../locale.js');

var page = new settingsCollection([
	new header(locale("DevSettingsHeader", "Developer options")),

	new label(locale("DevSettingsButtons", "Buttons")),
	new button(locale("DevSettingsReloadWindow", "Reload window"), () => {
		location.reload()
	}),
	new button(locale("DevSettingsToggleDevTools", "Toggle DevTools"), () => {
		currentWindow.webContents.toggleDevTools()
	}),

	new label(locale("DevSettingsElectronReload", "Enable electron-reload")),
	new toggle(new jsonprop("electronReload")),

	new label(locale("DevSettingsDevToolsOnStart", "Open DevTools on start")),
	new toggle(new jsonprop("devToolsOnStart")),

	new label(locale("DevSettingsEnableDevSettings", "Enable (these) developer settings")),
	new toggle(new jsonprop("devMenu")),

	new label(locale("DevSettingsElectronShortcuts", "Enable default electron shortcuts")),
	new toggle(new jsonprop("defaultShortcuts"))
])

module.exports = {
	name: locale("DevSettingsName", "Developer options"),
	page,
	id: "devsettings",
	hidden: true,
	position: 5,
	accentColor: "var(--accent1)"
}
