import { settingsCollection, header, label, input, uuid, userscript, noDOMonclick } from '../../settings';
import * as fusejs from "fuse.js";
/* import {generateTiles} from "../../server/generateTiles"; */
import * as $ from "jquery";
import * as palettes from "../../server/palettes";
import * as electron from "electron";
import * as editView from "./editView";

var fuse: any;

class app {
	id: string;
	$: JQuery;
	editPanel: editView.paletteEditor;
	actions: Array<appAction>;
	html: string;

	constructor(public palette: palettes.palette) {
		this.id = uuid();
		this.$ = $('<div></div>')
		.addClass('app')
		.attr('id', this.id)
		.attr('appName', palette.name)
		.append(
			$('<span></span>')
			.addClass('exeName')
			.text(palette.name)
		)
		.append(
			$('<div></div>')
			.addClass('actions')
		)
		.append(
			$('<img></img>')
			.addClass('icon')
			.attr('src', `data:image/${palette.icon.type};base64,${palette.icon.data}`)
		);

		this.editPanel = new editView.paletteEditor(palette);

		this.actions = [
			new appAction('edit', 'Edit this palette', () => {
				this.editPanel.toggle();
			}),
			new appAction('delete_outline', 'Delete this palette', () => {
				palettes.findByName(this.palette.name).delete();
				/* toast(`Deleted ${this.data.name}`, 2000, {type: 'complete'}); */
				$(`#${this.id}`).remove();
				electron.ipcRenderer.send('serverRestart')
			}, 'var(--accent0)')
		];

		this.$.find('.actions').append(...this.actions.map(action => action.html));

		this.html = this.$[0].outerHTML;
	}

	run() {
		this.editPanel.run();
		this.actions.forEach(action => {
			if (action.run) action.run();
		});
	}

	insert(id: string) {
		$(`#${id}`).append(this.html)
	}
}

class appAction {
	id: string;
	$: JQuery;
	onclick: noDOMonclick;
	html: string;

	constructor(icon?: any, title?: any, onclick?: any, color?: any) {
		this.id = uuid();
		this.$ = $('<i></i>')
		.attr('id', this.id)
		.addClass('material-icons-round')
		.addClass('edit-icon')
		.addClass(icon)
		.text(icon)

		this.onclick = new noDOMonclick(this.id, onclick);

		if (color) this.$.css('color', color);
		if (title) this.$.attr('title', title);

		this.html = this.$[0].outerHTML;
	}

	run() {
		this.onclick.run()
	}
}

class appList {
	apps: Array<app>;
	$: JQuery;
	appList: Array<palettes.palette>;
	html: string;
	id: string;

	constructor() {
		this.id = uuid();
		this.apps = [];
		this.$ = $('<div></div>')
		.attr('id', this.id)
		.addClass('apps');

		this.appList = [];

		this.$.append(...this.apps.map(app => app.$));

		this.html = this.$[0].outerHTML;

		this.load();
	}

	async load() {
		await palettes.load();
		this.appList.push(...palettes.apps);
		this.appList.forEach(palette => this.apps.push(new app(palette)));
		fuse = new fusejs(this.appList.map(i => ({ key: i.name })), {
			keys: ['key'],
			threshold: 0.2
		})
	}

	run() {
		this.apps.forEach(app => {
			app.insert(this.id);
			if (app.run) app.run();
		});
	}
}

var page = new settingsCollection([
	new header("Manage palettes"),

	new label("Search"),
	new input(null, (search: string) => {
		var res = fuse.search(search).map(i => i.key)
		if (res.length == 0 && search.trim() == "") {
			$('.app').css('display', 'block')
		} else {
			$('.app').css('display', 'none')
			res.forEach((i: string) => {
				$(`.app[appname="${i}"]`).css('display', 'block')
			})
		}
	}),
	new userscript(() => $('input').css('width', '100%')),

	new label("Palettes"),
	new appList()
])

module.exports = {
	name: "Manage palettes (beta)",
	page,
	id: "palettes",
	position: 1,
	icon: "border_all",
	accentColor: "var(--accent5)"
}
