var exeicon: any, linuxDesktop: any;
switch (process.platform) {
	case 'win32':
		exeicon = require('icon256').extractIconAsync;

	case 'linux':
		linuxDesktop = require('linux-desktop');
	linuxDesktop.indexItems();
}
var activeWin = require('active-win');
var fs = require('fs');
var util = require('util');
var readfile = util.promisify(fs.readFile);
var allApps = fs.readdirSync(__dirname + '/user/palettes');
var mkdir = util.promisify(fs.mkdir);
var writefile = util.promisify(fs.writeFile);
var readdir = util.promisify(fs.readdir);
var path = require('path');
var emptyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

module.exports.getCurrentProcess = async function(oldApp) {
	var returnObj: any = {};
	var win: any = await activeWin();
	var readCachedIcon: boolean = false;
	var noIcon: boolean = false;

	returnObj.unfName = win.owner.name;
	returnObj.name = win.owner.name;
	returnObj.title = win.title;
	returnObj.executable = win.owner.path;

	if(oldApp && returnObj.unfName == oldApp.unfName) noIcon = true;

	allApps.forEach(i => {
		if (String(i).toLowerCase().includes(String(returnObj.name).toLowerCase())) readCachedIcon = true;
	})

	console.time("switch")
	switch (process.platform) {
		case 'win32':
			returnObj.name = win.owner.name.slice(0, -4);
		if (!readCachedIcon && !noIcon) returnObj.icon = {
			data: await exeicon(returnObj.executable),
			type: 'png'
		}
		break;

		case 'linux':
			console.time("findDesktopEntry")
		var desktopEntry: any = linuxDesktop.findByExacutable(returnObj.executable);
		console.timeEnd("findDesktopEntry")
		if (!desktopEntry) {
			var p: string[] = returnObj.executable.split('/')
			desktopEntry = linuxDesktop.findByCommand(p[p.length - 1])
		} else {
			console.time("refineEntry")
			var desktopFile: any = linuxDesktop.refineEntry(desktopEntry);
			console.timeEnd("refineEntry")
			returnObj.name = desktopFile.Name;
			var filetype: any = String(desktopFile.Icon).match(/^(.+\.)(.+)$/)[2];
			/* console.log(desktopFile.Icon) */
			if (!readCachedIcon && !noIcon) returnObj.icon = {
				data: await readfile(desktopFile.Icon, "base64"),
				type: filetype
			};
		}
		break;
	}
	console.timeEnd("switch")

	// findDesktopEntry: 0.038ms
	// refineEntry: 1679.093ms
	// switch: 1679.285ms
	// readCachedIcon: true
	// noIcon: true

	// WYYYYYYYYY >:(((

	console.log(`readCachedIcon: ${readCachedIcon}\nnoIcon: ${noIcon}`)
	if (readCachedIcon && !noIcon) {
		var location: string = __dirname.replace(/\\/g, "/") + "/user/palettes/" + returnObj.name
		var files: string[] = await readdir(location)
		var iconFile: any = files.find(f => f.includes('icon')).match(/^(.+\.)(.+)$/);
		returnObj.icon = {
			data: await readfile(path.join(location, iconFile[0]), "base64"),
			type: iconFile[2]
		};
	} else /* if(!allApps.includes(returnObj.name)) */ {
		var appPath = __dirname + '/user/palettes/' + returnObj.name
		allApps.push(returnObj.name)
		await mkdir(appPath);
		await writefile(appPath + '/app.json', '{}')
		await writefile(appPath + '/palette.json', '[]')
		console.log(`type: ${returnObj.icon.type} data: ${returnObj.icon.data.toString().substr(0, 20)}`)
		await writefile(appPath + '/icon.' + returnObj.icon.type, returnObj.icon.data, 'base64')
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
