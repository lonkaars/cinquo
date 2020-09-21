import { overlay, uuid, header, noDOMonclick, toggle } from "../../settings";
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
}

export class globalActionIcon implements globalAction {
	id: string;
	$: JQuery;
	html: string;
	onclick: noDOMonclick;

	constructor(icon: string) {
		this.id = uuid();
		this.$ = $("<div></div>");
		this.$.addClass("globalAction");
		this.$.append(
			$("<i></i>")
				.addClass("material-icons-round")
				.css("padding", "8px")
				.text(icon)
		);
		this.html = this.$[0].outerHTML;
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
		this.$.addClass("globalAction");
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
}

export class paletteEditor {
	id: string;
	$: JQuery;
	html: string;
	overlay: overlay;

	constructor(public palette: palette) {
		this.id = uuid();
		this.$ = $("<div></div>");
		this.$.addClass("paletteEditor");

		var h = new header(palette.name);
		h.$.css("display", "inline-block");
		this.$.append(h.$);

		var actionList = new globalActionList();
		actionList.add(new globalActionIcon("add"));
		actionList.add(new globalActionIcon("visibility_off"));
		actionList.add(new globalActionButton("Bulk mode", () => console.log("gert")));
		this.$.append(actionList.html);

		this.html = this.$[0].outerHTML;
		this.overlay = new overlay(this.html);
	}

	run() {
		this.overlay.run();
	}

	toggle() {
		document.documentElement.style.setProperty("--menu-width", "79px"),
		this.overlay.toggle();
	}
}

