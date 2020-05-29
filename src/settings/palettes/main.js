var {
	settingsCollection,
	header,
	label,
	input,
	uuid,
	userscript,
	noDOMonclick,
	overlay
} = require(__dirname + '/../../settings.js'),
	fs = require('fs'),
	// rimraf = require('rimraf'),
	palettes = fs.readdirSync(__dirname + '/../../server/user/palettes'),
	fusejs = require('fuse.js'),
	// generateTiles = require(__dirname + '/../../server/generateTiles.js').generateTiles,
	path = require('path'),
	fuse = new fusejs(palettes.map(i => {
		return {
			'key': i
		}
	}), {
		keys: ['key'],
		threshold: 0.2
	}),
	apps = [];

palettes.forEach(name => {
	var app = { name };
	var appPath = path.join(__dirname, '/../../server/user/palettes/', name);
	var appDir = fs.readdirSync(appPath);
	var iconFile = appDir.find(f => f.includes('icon')).match(/^(.+\.)(.+)$/);
	app.icon = {
		data: fs.readFileSync(path.join(appPath, iconFile[0]), "base64"),
		type: iconFile[2]
	};

	apps.push(app)
})
// sort alphabetical without case here

class app {
	constructor(data) {
		this.id = uuid();
		this.data = data;
		this.$ = $('<div></div>')
			.addClass('app')
			.attr('appName', data.name)
			.append(
				$('<span></span>')
				.addClass('exeName')
				.text(data.name)
			)
			.append(
				$('<div></div>')
				.addClass('actions')
			)

		if (!data.icon) {
			this.$.addClass('noIcon')
		} else {
			this.$.append(
				$('<img></img>')
				.addClass('icon')
				.attr('src', `data:image/${data.icon.type};base64,${data.icon.data}`)
			)
		}

		this.editPanel = new overlay(
			$('<h1></h1>').text(this.data.name)
		);
		this.actions = [
			new appAction('edit', 'Edit this palette', () => {
				this.editPanel.toggle();
			}),
			new appAction('delete_outline', 'Delete this palette', () => {
				console.log("banaan")
			}, 'var(--accent0)')
		]

		this.$.find('.actions').append(...this.actions.map(action => action.html));

		this.html = this.$[0].outerHTML;
	}

	run() {
		this.editPanel.run();
		this.actions.forEach(action => {
			if (action.run) action.run();
		})
	}
}

class appAction {
	constructor(icon, title, onclick, color) {
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
	constructor(apps) {
		this.apps = apps
		this.$ = $('<div></div>')
			.addClass('apps');

		this.appList = [];

		this.apps.forEach(a => {
			this.appList.push(new app(a))
		});

		this.$.append(...this.appList.map(app => app.$));

		this.html = this.$[0].outerHTML;
	}

	run() {
		this.appList.forEach(app => {
			if (app.run) app.run();
		})
	}
}


var page = new settingsCollection([
	new header("Manage palettes"),

	new label("Search"),
	new input(null, search => {
		var res = fuse.search(search).map(i => i.key)
		if (res.length == 0 && search.trim() == "") {
			$('.app').css('display', 'block')
		} else {
			$('.app').css('display', 'none')
			res.forEach(i => {
				$(`.app[appname="${i}"]`).css('display', 'block')
			})
		}
	}),
	new userscript(() => $('input').css('width', '100%')),

	new label("Palettes"),
	new appList(apps)
])

module.exports = {
	name: "Manage palettes (beta)",
	page,
	id: "palettes",
	position: 1,
	accentColor: "var(--accent5)"
}
