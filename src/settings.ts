var fs = require('fs'),
	uuid = require('uuid/v4'),
	_ = require('lodash'),
	timer = setTimeout(() => { }, 0);

/**
 * $ is defined, since this file is loaded after jquery
 * Some things here are defined in renderer.js
 *
 * Beware of spaghetti code
 */

module.exports = {
	pages: [],
	uuid,

	jsonprop: class {
		val: any;

		constructor(public key: string) {
			this.val = _.get(config, this.key);
		}

		set(n) {
			this.val = n;
			_.set(config, this.key, this.val);
			module.exports.save();
		}

		toggle() {
			if (typeof this.val != 'boolean') return;
			this.set(!this.val)
		}
	},

	delayedSave: delay => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			module.exports.save()
			toast('Settings saved', 2000, {
				type: 'complete'
			})
		}, delay);
	},

	save: () => {
		fs.writeFileSync(__dirname + '/server/user/config.json', JSON.stringify(config, null, 4))
	},


	header: class {
		public id: string = uuid();
		$: any;
		html: string;

		constructor(public text: string) {
			this.$ = $("<h1></h1>")
			.text(this.text)
			.attr("id", this.id);
			this.html = this.$[0].outerHTML;
		};
	},

	label: class {
		public id: string = uuid();
		$: any;
		html: string;

		constructor(public text: string, help) {
			this.id = uuid();
			this.$ = $("<span></span>")
			.text(this.text)
			.addClass('label')
			.attr("id", this.id);
			if (help) this.$.attr('customTitle', help);
			this.html = this.$[0].outerHTML;
		};

		run() {
			$(`#${this.id}[customTitle]`)
			.after(
				$('<i></i>')
				.addClass('material-icons-round')
				.css({
					'font-size': '18px',
					'opacity': '.5'
				})
				.text('help')
			)
			.on('mouseenter', function () {
				tooltip = true;
				$('.tooltip')
				.text($(this).attr('customTitle'))
				.css('visibility', 'visible')
			})
			.on('mouseleave', () => {
				tooltip = false;
				$('.tooltip').css('visibility', 'hidden')
			})
		}
	},

	toggle: class {
		public id: string = uuid();
		$: any;
		html: string;
		onclick: any;

		constructor(state, onclick) {
			this.id = uuid();
			this.$ = $("<div></div>")
			.addClass('button')
			.attr("id", this.id)
			.append($('<div></div>').addClass('track'))
			.append($('<div></div>').addClass('thumb'))

			if (state instanceof module.exports.jsonprop) {
				this.$.addClass(state.val ? 'on' : 'off')
				this.onclick = () => {
					state.toggle();
				}
			} else {
				this.onclick = onclick;
				this.$.addClass(state ? 'on' : 'off')
			}

			this.html = this.$[0].outerHTML;
		}

		addOnClick(el) {
			var onclick = this.onclick
			// $(el).on('click', this.onclick($(el).hasClass('off')));
			$(el).on('click', function () {
				$(this).toggleClass('on off');
				onclick($(this).hasClass('off'));
			});
		}
	},

	button: class {
		public id: string = uuid();
		$: any;
		html: string;
		onclick: any;

		constructor(label, onclick) {
			this.id = uuid();
			this.onclick = onclick;
			this.$ = $('<button></button>')
			.attr('id', this.id)
			.text(label)

			this.html = this.$[0].outerHTML;
		}

		addOnClick(el) {
			$(el).on('click', this.onclick);
		}
	},

	paragraph: class {
		public id: string = uuid();
		$: any;
		html: string;

		constructor(public text: string, html: boolean) {
			this.id = uuid();
			this.$ = $("<p></p>")
			.attr("id", this.id)[html ? "html" : "text"](text);
			this.html = this.$[0].outerHTML;
		};
	},

	// this is pretty spaghetti
	dropdown: class {
		public id: string = uuid();
		$: any;
		html: string;
		els: any[];

		constructor(items: Array<string>, callback) {
			this.id = uuid();
			this.$ = $('<div></div>')
			.addClass('list')
			.attr('id', this.id);
			this.els = [];

			for (let i = 0; i < items.length; i++) {
				var id = uuid();
				this.els.push({
					id,
					el: $('<span></span>')
					.addClass(`item${i == 0 ? ' select' : ''}`)
					.text(items[i])
					.attr('id', id),
					onclick: function (context) {
						callback($(context).text())
					}
				})
			}
			this.els.forEach(item => {
				this.$.append(item.el)
			})

			this.$.children('.item.select').html(
				$('<span></span>')
				.html(this.$.children('.item.select').html())
				.addClass('value')
			)

			this.html = this.$[0].outerHTML;
		}

		run() {
			this.els.forEach(item => {
				$(`#${item.id}`).on('click', function () {
					if ($(this).hasClass('select')) return;
					item.onclick(this)
				})
			})

			$(`#${this.id}`)
			.on('click', function () {
				$(this).css('--full-height', `${$(this)[0].scrollHeight}px`)
				$(this).toggleClass('open')
			});

			$(`#${this.id} .item:not(.select)`)
			.on('click', function () {
				$(this).parent().children('.select').children('.value').text($(this).text())
			});

			$(`#${this.id} .item.select`).append(
				$("<span></span>")
				.addClass('arrow')
				.text("▼")
			)
		}
	},

	input: class {
		public id: string = uuid();
		val: string;
		$: any;
		html: string;

		constructor(initial: string, public callback: void, type: string) {
			this.val = initial ? initial : "";
			this.$ = $('<input></input>')
			.attr('type', type ? type : 'text')
			.attr('id', this.id);

			this.html = this.$[0].outerHTML;
		}

		run() {
			var callback: any = this.callback;
			var initial: string = this.val;
			$(`#${this.id}`)
			.val(initial)
			.on("change paste keyup", function () {
				callback($(this).val())
			})
		}
	},

	noDOMonclick: class {
		constructor(public id:string, public onclick: any) { }

		run() {
			$(`#${this.id}`).on('click', this.onclick);
		}
	},

	userscript: class {
		constructor(public script: any) { }

		run() {
			this.script();
		}
	},


	settingsCollection: class {
		constructor(public sourceArray: Array<any>) { };

		insert() {
			var out = "";
			this.sourceArray.forEach(settingsItem => {
				if (settingsItem.html) out += `\n\n${settingsItem.html}`
			});
			$(".main .inner").html(out);
		};

		afterInserted() {
			this.sourceArray.forEach(el => {
				if (el.addOnClick) el.addOnClick($(`#${el.id}`));
				if (el.run) el.run();
			})
		};
	},


	generateCategories: () => {
		var folders = fs.readdirSync(__dirname + "/settings").filter(i => !i.includes('.'));

		for (var folder in folders) {
			var main = `${__dirname}/settings/${folders[folder]}/main.js`;
			if (fs.existsSync(main)) module.exports.pages.push(require(main));
		}

		var html = "";
		module.exports.pages.sort((a, b) => a.position - b.position);
		module.exports.pages.forEach(page => {

			// Don't include hidden pages except for the developer menu
			if (page.hidden && page.id != 'devsettings') return;
			if (page.id == 'devsettings' && !config.devMenu) return;

			html += $("<div></div>")
			.addClass('category')
			.css('--category-color', page.accentColor)
			.attr('category', page.id)
			.append(
				$('<div></div>')
				.addClass('bar')
			)
			.append(
				$('<span></span>')
				.addClass('name')
				.text(page.name)
			)[0].outerHTML
		});

		return html
	},

	categoriesOnClick: () => {
		$('.categories .category').on('click', function () {
			var thiscat = module.exports.pages.find(p => p.id == $(this).attr('category'))

			$('.categories .category').removeClass('active')
			$(this).addClass('active')

			document.documentElement.style.setProperty('--accent-color', thiscat.accentColor);

			thiscat.page.insert()
			thiscat.page.afterInserted()
		})
	},

	load: () => {
		$('.categories').html(module.exports.generateCategories());
		module.exports.categoriesOnClick();
	},

	overlay: class {
		public id: string = uuid();
		$: any;
		html: string;
		previousScrollPosition: number;

		constructor(public content: any) {
			this.previousScrollPosition = $('.main').scrollTop();
			this.$ = $('<div></div>')
			.addClass('inner pane')
			.attr('id', this.id)
			.css('top', `${this.previousScrollPosition}px`)
			.append(content);

			this.html = this.$[0].outerHTML;
		}

		run() {
			$('.main').append(this.html);
		}

		toggle() {
			$(`#${this.id}`).toggleClass('active');
			$('.main .inner:not(.pane)').toggleClass('blur');
			$('.main').css('overflow-y', $('.main').css('overflow-y') == 'hidden' ? 'scroll' : 'hidden');
		}

		destroy() {
			$(`#${this.id}`).remove();
			$('.main .inner').removeClass('blur');
			$('.main').css('overflow-y', 'scroll');
		}
	},
};
