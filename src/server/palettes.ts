import * as fs from "fs";
import * as util from "util";
import * as path from "path";

var	readdir = util.promisify(fs.readdir),
	mkdir = util.promisify(fs.mkdir),
	rmdir = util.promisify(fs.rmdir),
	writefile = util.promisify(fs.writeFile),
	readfile = util.promisify(fs.readFile),
	palettesPath = path.join(__dirname, '/user/palettes');

export var apps: Array<palette> = [];

interface paletteData {
	name: string,
	palette: any,
	config: any,
	icon: paletteIcon
}

export interface paletteIcon {
	data: string;
	type: string;
	formatted?: string;
}

export class palette implements paletteData {
	name: string;
	path: string;
	palette: any;
	config: any;
	icon: paletteIcon;
	constructor(data: paletteData) {
		for (let key in data)
			this[key] = data[key];
		this.path = path.join(palettesPath, this.name);
		this.icon.formatted = `data:image/${this.icon.type};base64,${this.icon.data}`;
	}

	async delete() {
		await rmdir(this.path, {maxRetries: 3, recursive: true});
		apps = apps.filter((app: palette) => app.name != this.name);
	}

	async save() {
		let appList: Array<string> = await readdir(palettesPath);
		if(!appList.includes(this.name)) await mkdir(this.path);
		await writefile(path.join(this.path, '/palette.json'), JSON.stringify(this.palette, null, 4));
		await writefile(path.join(this.path, '/app.json'), JSON.stringify(this.config, null, 4));
		if(this.icon)
			await writefile(path.join(this.path, '/icon.' + this.icon.type), this.icon.data, "base64");
	}
}

export async function load() {
	let appList: Array<string> = await readdir(palettesPath);
	await Promise.all(appList.map(async (appName: string) => {
		let appPath: string = path.join(palettesPath, appName);
		let appDir: Array<string> = await readdir(appPath);
		let iconFile: string = appDir.find((file: string) => file.includes('icon'));
		let paletteData: paletteData = {
			name: appName,
			palette: require(path.join(appPath, '/palette.json')),
			config: require(path.join(appPath, '/app.json')),
			icon: {
				type: path.extname(iconFile).substr(1),
				data: await readfile(path.join(appPath, iconFile), 'base64')
			}
		}
		apps.push(new palette(paletteData));
	}));
}

export async function create(name: string, icon: paletteIcon) {
	let p = new palette({
		name,
		palette: [],
		config: {},
		icon
	})
	await p.save();
	apps.push(p);
	return p;
}

export var find = (criteria: any) => apps.find(criteria);
export var findByName = (name: string) => apps.find((app: palette) => app.name == name);

