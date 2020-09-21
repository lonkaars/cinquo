import { settingsCollection, header, dark, jsonprop, label, toggle, toggleJSON, dropdown, delayedSave, save, input, button, config } from "../../settings";
import * as locale from "../../locale";
import * as fs from "fs";
import * as $ from "jquery";

var names = fs.readdirSync(__dirname + '/../../themes').filter(i => i.match(/.+(\-(light)|(dark))\.css/))
var uniqueThemes = names.map(i => i.slice(0, i.match(/.+(\-light)\.css/) ? -10 : -9))
uniqueThemes = uniqueThemes.filter((v, i) => uniqueThemes.indexOf(v) == i)
var themes = [];
for (let i = 0; i < uniqueThemes.length; i++) {
	themes.push({
		name: uniqueThemes[i],
		dark: names.find(s => s == `${uniqueThemes[i]}-dark.css`),
		light: names.find(s => s == `${uniqueThemes[i]}-light.css`)
	})
}
var activeTheme: Function = (): string => $('#theme').attr('href').slice(7, $('#theme').attr('href').endsWith('-light.css') ? -10 : -9)

var page = new settingsCollection([
	new header("General settings"),

	new label("Dark settings"),
	new toggle(() => dark(), () => {
		$(document.body)[`${dark() ? 'remove' : 'add'}Class`]('dark')
		$('#theme').attr('href', `${$('#theme').attr('href').slice(0, dark() ? -9 : -10)}-${dark() ? 'light' : 'dark'}.css`)
		config.settingsTheme = $('#theme').attr('href')
		save()
	}),

	new label("Settings theme"),
	new dropdown([activeTheme, ...themes.map(o => (() => o.name))], n => {
		$('#theme').attr('href', `themes/${n}-${dark() ? 'dark' : 'light'}.css`)

		config.settingsTheme = $('#theme').attr('href')
		save()
	}),

	new label("Use blur effects"),
	new toggleJSON('blurFx'),

	new label("Always palette", "Always load this palette regardless of foreground app"),
	new input(() => config.alwaysPalette, n => {
		config.alwaysPalette = n
		delayedSave(1000)
	}),

	new label("Exit cinquo"),
	new button("Exit", () => {
		electron.ipcRenderer.send('quit')
		currentWindow.close()
	})
])

module.exports = {
	name: "General",
	page,
	id: "general",
	position: 3,
	icon: "settings",
	accentColor: "var(--accent7)"
}
