import * as fs from "fs";
var config = require(__dirname + '/server/user/config.json');

if (!config.language) config.language = 'en-en';
var localeLocation = `${__dirname}/locale/${config.language}.json`
var locale: any = {};
if (fs.existsSync(localeLocation)) locale = require(localeLocation);

module.exports = (key:string, backup:string) => {
	if (!locale.meta) return backup;
	return locale[key] ? locale[key] : backup
}
