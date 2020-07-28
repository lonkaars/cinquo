import * as activeWin from "active-win";
import * as fs from "fs";
import * as util from "util";
import * as path from "path";

var readfile = util.promisify(fs.readFile);
let exeicon: any, linuxDesktop: any;

switch (process.platform) {
	case 'win32': {
		exeicon = require('icon256').extractIconAsync;
		break;
	}

	case 'linux': {
		linuxDesktop = require('linux-desktop');
		linuxDesktop.indexItems();
		break;
	}
}

export interface process {
	name: string,
	title: string,
	executable: string,
	iconPath: string
}

export async function getCurrentProcess () {
	var returnObj = <process>{};
	var win: activeWin.Result = await activeWin();

	if(!win) return {
		name: "",
		title: "",
		executable: "",
		iconPath: ""
	}

	returnObj.name = win.owner.name;
	returnObj.title = win.title;
	returnObj.executable = win.owner.path;

	switch (process.platform) {
		case 'win32': {
			returnObj.name = win.owner.name.slice(0, -4);
			returnObj.iconPath = win.owner.path;
			break;
		}

		case 'linux': {
			var desktopEntry: any = linuxDesktop.findByExacutable(returnObj.executable);
			if (!desktopEntry) desktopEntry = linuxDesktop.findByCommand(path.basename(returnObj.executable));
			var desktopFile: any = linuxDesktop.refineEntry(desktopEntry);
			returnObj.name = desktopFile.Name;
			returnObj.iconPath = desktopFile.Icon;
			break;
		}
	}

	return returnObj;
}


export async function getIcon (iconPath: string) {
	switch (process.platform) {
		case 'win32': {
			return {
				data: await exeicon(iconPath),
				type: 'png'
			}
		}

		case 'linux': {
			return {
				data: await readfile(iconPath, "base64"),
				type: path.extname(iconPath).substr(1)
			}
		}
	}
}

