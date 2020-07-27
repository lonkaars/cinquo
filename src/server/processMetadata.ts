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
var activeWin = require('active-win'),
    fs = require('fs'),
    util = require('util'),
    readfile = util.promisify(fs.readFile),
    allApps = fs.readdirSync(__dirname + '/user/palettes'),
    mkdir = util.promisify(fs.mkdir),
    writefile = util.promisify(fs.writeFile),
    readdir = util.promisify(fs.readdir),
    path = require('path'),
    emptyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

module.exports.getCurrentProcess = async function(oldApp: any) {
	var returnObj: any = {};
	var win: any = await activeWin();
	var readCachedIcon: boolean = false;
	var noIcon: boolean = false;

	if(!win) return {
		unfName: "",
		name: "",
		title: "",
		executable: "",
		noWin: true
	}

	returnObj.unfName = win.owner.name;
	returnObj.name = win.owner.name;
	returnObj.title = win.title;
	returnObj.executable = win.owner.path;
	returnObj.noWin = false;

	if(oldApp && returnObj.unfName == oldApp.unfName) noIcon = true;

	allApps.forEach(i => {
		if (String(i).toLowerCase().includes(String(returnObj.name).toLowerCase())) readCachedIcon = true;
	});

	switch (process.platform) {
		case 'win32': {
			returnObj.name = win.owner.name.slice(0, -4);
			if (!readCachedIcon && !noIcon) returnObj.icon = {
				data: await exeicon(returnObj.executable),
				type: 'png'
			}
			break;
		}

		case 'linux': {
			var desktopEntry: any = linuxDesktop.findByExacutable(returnObj.executable);
			if (!desktopEntry) {
				var p: string[] = returnObj.executable.split('/');
				desktopEntry = linuxDesktop.findByCommand(p[p.length - 1]);
			} else {
				var desktopFile: any = linuxDesktop.refineEntry(desktopEntry);
				returnObj.name = desktopFile.Name;
				var filetype: any = String(desktopFile.Icon).match(/^(.+\.)(.+)$/)[2];
				if (!readCachedIcon && !noIcon) returnObj.icon = {
					data: await readfile(desktopFile.Icon, "base64"),
					type: filetype
				}
			}
			break;
		}
	}

	var location: string = path.join(__dirname, "/user/palettes", returnObj.name);
	if (readCachedIcon && !noIcon) {
		var files: string[] = await readdir(location);
		var iconIndex: any = files.find(f => f.includes('icon'));
		if(iconIndex) {
			var iconFile: any = iconIndex.match(/^(.+\.)(.+)$/);
			returnObj.icon = {
				data: await readfile(path.join(location, iconFile[0]), "base64"),
				type: iconFile[2]
			}
		}
	} else if(!allApps.includes(returnObj.name)) {
		allApps.push(returnObj.name);
		await mkdir(location);
		await writefile(path.join(location, '/app.json'), '{}');
		await writefile(path.join(location, '/palette.json'), '[]');
		await writefile(path.join(location, '/icon.' + returnObj.icon.type), returnObj.icon.data, 'base64');
	}

	// return empty icon
	if (!returnObj.icon && !noIcon) returnObj.icon = {
		data: emptyPng,
		type: "png"
	}

	// return previous icon
	if(noIcon) returnObj.icon = oldApp.icon;

	returnObj.icon.formatted = `data:image/${returnObj.icon.type};base64,${returnObj.icon.data}`;

	return returnObj;
}
