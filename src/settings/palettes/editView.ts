import { overlay, uuid, header, noDOMonclick, toggle } from "../../settings";
import { generateTiles } from "../../server/generateTiles";
import { palette } from "../../server/palettes";
import * as $ from "jquery";

export class actionContent {
	id: string;
	$: JQuery;
	html: string;

	constructor(jq: JQuery) {
		this.$ = jq;
		this.html = jq[0].outerHTML;
	}
}

export class globalAction {
	id: string;
	$: JQuery;
	html: string;
	run: Function;
}

export class globalActionIcon implements globalAction {
	id: string;
	$: JQuery;
	html: string;
	onclick: noDOMonclick;

	constructor(icon: string, onclick: Function) {
		this.id = uuid();
		this.$ = $("<div></div>");
		this.$.addClass("globalAction globalActionIcon");
		this.$.attr("id", this.id);
		this.onclick = new noDOMonclick(this.id, () => onclick(this.id));
		this.$.append(
			$("<i></i>")
				.addClass("material-icons-round")
				.css("padding", "8px")
				.text(icon)
		);
		this.html = this.$[0].outerHTML;
	}

	run() { 
		this.onclick.run();
	}
}
export class globalActionButton implements globalAction {
	id: string;
	$: JQuery;
	html: string;
	toggle: toggle;

	constructor(public label: string, public onclick: Function) {
		this.id = uuid();
		this.$ = $("<div></div>");
		this.$.addClass("globalAction globalActionToggle");
		this.toggle = new toggle(() => false, this.onclick);
		this.$.append(
			$("<span></span>")
				.text(this.label)
		);
		this.$.append(
			this.toggle.html
		);
		this.html = this.$[0].outerHTML;
	}

	run() {
		this.toggle.run();
	}
}

export class globalActionList {
	id: string;
	$: JQuery;
	html: string;
	actions: Array<globalAction>;

	update() {
		this.$ = $("<div></div>");
		this.$.addClass("globalActionList");
		this.$.css("display", "inline-block");
		this.actions.forEach(action => this.$.prepend(action.html));
		this.html = this.$[0].outerHTML;
	}

	constructor(actions?: Array<globalAction>) {
		this.actions = actions || Array();
		this.update();
	}

	add(action: globalAction) {
		this.actions.push(action);
		this.update();
	}

	run() {
		this.actions.forEach(action => action.run?.());
	}
}

export class tileViewAction {
	id: string;
	$: JQuery;
	html: string;
	onclick: noDOMonclick;

	constructor(public icon: string, onclick: Function) {
		this.id = uuid();
		this.onclick = new noDOMonclick(this.id, onclick);
		this.$ = $("<div></div>")
			.addClass("tileViewAction")
			.append(
				$("<i></i>")
				.addClass("icon material-icons-round")
				.text(icon)
			);
		this.html = this.$[0].outerHTML;
	}

	run() {
		this.onclick.run();
	}
}

export class tileViewActions {
	id: string;
	$: JQuery;
	html: string;
	actions: Array<tileViewAction>;

	constructor(public el: JQuery) {
		this.id = uuid();
		this.$ = $("<div></div>")
		.addClass("tileViewActions");
		this.actions = [
			new tileViewAction("delete_outline", () => console.log("verwijder?")),
			new tileViewAction("edit", () => console.log("bewerk?")),
			new tileViewAction("open_in_full", () => console.log("resize?"))
		]
		this.actions.forEach(a => this.$.append(a.html));
		this.html = this.$[0].outerHTML;
	}

	run() {
		this.actions.forEach(a => a.run());
	}
}

export class paletteView {
	id: string;
	$: JQuery;
	html: string;

	constructor(public palette: palette) {
		this.id = uuid();
		this.$ = $("<div></div>");
		this.$.addClass("paletteView panels noAni mono")
		this.renderTiles();
		$("head").append(
			$("<link/>")
			.attr("rel", "stylesheet")
			.attr("type", "text/css")
			.attr("media", "screen")
			.attr("href", "client/css/panels.css")
		)

		this.html = this.$[0].outerHTML;
	}

	renderTiles() {
		var $$ = $(generateTiles(this.palette.palette, this.palette.config));
		$$.each(function(){
			$(this).append(new tileViewActions($(this)).html)
		});
		this.$.append($$);
	}

	run() { }
}

export class paletteEditor {
	id: string;
	$: JQuery;
	html: string;
	overlay: overlay;
	actionList: globalActionList;
	header: header;
	paletteView: paletteView;

	constructor(public palette: palette) {
		this.id = uuid();
		this.$ = $("<div></div>");
		this.$.attr("id", this.id);
		this.$.addClass("paletteEditor");

		this.header = new header(palette.name);
		this.header.$.css("display", "inline-block");
		this.$.append(this.header.html);

		this.actionList = new globalActionList();
		this.actionList.add(new globalActionIcon("add", () => console.log(`banaan ${this.id}`)));
		this.actionList.add(new globalActionIcon("visibility_off", (buttonID: string) => {
			$(`#${this.id} .paletteView`).toggleClass("mono")
			$(`#${buttonID} i`).text($(`#${buttonID} i`).text() == "visibility_off" ? "visibility" : "visibility_off");
			$(`#${buttonID}`).toggleClass("on off")

		}));
		this.actionList.add(new globalActionButton("Bulk mode", () => console.log("gert")));
		this.$.append(this.actionList.html);

		this.paletteView = new paletteView(this.palette);
		this.$.append(this.paletteView.html);

		this.html = this.$[0].outerHTML;
		this.overlay = new overlay(this.html);
	}

	run() {
		this.overlay.run();
		this.actionList.run();
		this.paletteView.run();
	}

	toggle() {
		document.documentElement.style.setProperty("--menu-width", "79px"),
		$(".menu").addClass("small")
		this.overlay.toggle();
	}
}

