var {
	settingsCollection,
	header,
	button,
	label,
	toggleJSON,
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
	new toggleJSON("electronReload"),

	new label(locale("DevSettingsDevToolsOnStart", "Open DevTools on start")),
	new toggleJSON("devToolsOnStart"),

	new label(locale("DevSettingsEnableDevSettings", "Enable (these) developer settings")),
	new toggleJSON("devMenu"),

	new label(locale("DevSettingsElectronShortcuts", "Enable default electron shortcuts")),
	new toggleJSON("defaultShortcuts"),

	new label(locale("DevSettingsEnableResize", "Enable window resizability")),
	new toggleJSON("windowResizable")
])

module.exports = {
	name: locale("DevSettingsName", "Developer options"),
	page,
	id: "devsettings",
	hidden: true,
	position: 5,
	icon: "code",
	accentColor: "var(--accent1)"
}
