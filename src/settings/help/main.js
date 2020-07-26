var {
	settingsCollection,
	header,
	paragraph,
	label,
	userscript
} = require('../../settings.js');

var os = require('os');
var dns = require('dns');
var port = config.serverPort == 80 ? "" : `:<span>${config.serverPort}</span>`;
var hostname = os.hostname().toLowerCase();

var page = new settingsCollection([
	new header("Help"),

	new label("How to connect"),
	new paragraph([
		"Open Safari on your device and navigate to",
		`http://<span>${hostname}</span>${port}`,
		"or",
		`http://<span id="ip"></span>${port}`,
		"then tap share, and add to home menu"
	].join('<br>\n'), true),

	new userscript(() => {
		dns.lookup(os.hostname(), (err, add, fam) => {
			$('#ip').text(add)
		})
	})
])

module.exports = {
	name: "Help",
	page,
	id: "help",
	position: 4,
	accentColor: "var(--accent0)"
}
