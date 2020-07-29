import { settingsCollection, header, paragraph, label, userscript, config } from "../../settings.js";
import * as os from "os";
import * as dns from "dns";
import * as $ from "jquery";
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
		dns.lookup(os.hostname(), (error: Error, adress: string) => {
			$('#ip').text(adress)
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
