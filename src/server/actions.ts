import * as robot from "robotjs";
import * as path from "path";
import * as openFile from "open";
import * as midi from "midi";
import * as fs from "fs";

var output = new midi.Output();

// Get cinquo loop midi device
for (let i = 0; i < output.getPortCount(); i++)
	if (output.getPortName(i).toLowerCase().includes('cinquo'))
		output.openPort(i);

// Load modules
var dirs = fs.readdirSync(__dirname + "/modules");
var modules = [];
dirs = dirs.filter((i: string) => ['node_modules', 'package-lock.json', 'package.json'].includes(i));
for(let i = 0; i < dirs.length; i++) {
	var dir = fs.readdirSync(path.join(__dirname, `/modules/${dirs[i]}`));
	if(!dir.includes('package.json'))
		continue;
	var modulePackage = JSON.parse(fs.readFileSync(__dirname + `/modules/${dirs[i]}/package.json`).toString());
	modules.push({
		name: modulePackage.name,
		main: require(__dirname + `/modules/${dirs[i]}/${modulePackage.main}`)
	});
}

export function action (a: any, d: any) {
	if (!a || !a.action)
		return;

	switch (a.action.type) {
		case "keystroke": {
			robot.keyTap(a.action.key, a.action.modifiers);
			break;
		}
		case "midi": {
			// [type, note, velocity/value]

			if (a.type == "button") {
				// Button (press key)
				var i = 0;
				var loop = setInterval(() => {
					if (i + 1 == a.action.midiData.length) clearInterval(loop);
					output.sendMessage(a.action.midiData[i]);
					i++;
				}, a.action.midiDelay);
			} else {
				// Slider with variable
				var msg = [];
				for (let i = 0; i < 3; i++)
					msg[i] = a.action.midiData[i] == "var" ? Math.floor(Number(d.val)) : a.action.midiData[i];
				output.sendMessage(msg);
			}
			break;
		}
		case "file": {
			openFile(a.action.file);
			break;
		}
		case "module": {
			if(modules.map(i => i.name).includes(a.action.module))
				modules.find(i => i.name == a.action.module).main.run(a.action.data);
			break;
		}
	}
}
