var $ = require('jquery'),
	fs = require('fs'),
	Terminal = require('xterm').Terminal,
	tooltip = false,
	electron = require('electron'),
	currentWindow = electron.remote.getCurrentWindow(),
	config = require(__dirname + '/server/user/config.json'),
	settingsjs = require(__dirname + '/settings.js'),
	FitAddon = require('xterm-addon-fit').FitAddon;

var fitAddon = new FitAddon();
var term = new Terminal({
	rows: 24,
	fontFamily: 'Fira Code, consolas, monospace'
});

term.loadAddon(fitAddon)

electron.ipcRenderer.on('serverMessage', (event, data) => {
	term.write(data);
});
electron.ipcRenderer.on('previousServerLogs', (event, data) => {
	term.write(data.join(''));
});

$(window).on('load', () => {
	// Theme setting and adding dark class to body if dark theme
	$('#theme').attr('href', config.settingsTheme)
	if (settingsjs.dark) $('body').addClass('dark');

	settingsjs.load()

	// Move help tooltip
	$(window).on('mousemove', function (event) {
		if (!tooltip) return;
		$('.tooltip').css({
			'top': event.pageY + 10,
			'left': event.pageX + 10
		})
	})

	// Close button
	$('.titlebar .close').on('click', () => {
		currentWindow.close()
	})
})


/* function switchPage(page, accent) {
   $('.main .inner').html(pages.find(p => p.page == page).content);
   document.documentElement.style.setProperty('--accent-color', accent);
   currentPage = page
   loadButtons()
   loadTooltips()
   loadDropdowns()
   $('.inner *').addClass('notrans')
   anime({
targets: '.inner > *',
opacity: [0, 1],
translateY: [30, 0],
duration: 700,
easing: 'easeOutExpo',
delay: anime.stagger(10),
complete: (anim) => {
$('.inner *').removeClass('notrans')
$('button').attr('style', '')
}
})
} */

// move to settings.ts as class
function toast(text: string, duration: number, options: any) {
	if (options && options.html) {
		$('.toast').html(options.html)
	} else {
		$('.toast h3').text(text)
	}
	$('.toast')
	.attr('class', 'toast')
	.addClass(options ? options.type : '')
	.addClass('show');
	setTimeout(() => {
		$('.toast').removeClass('show')
	}, duration);
}

function fileExists(file: string) {
	try {
		fs.readFileSync(file)
		return true
	} catch (error) {
		return false
	}
}

/* function newPane(paneID) {
   var id = `pane-${paneID.replace(/\s/g, '-')}`
   $('.main').append(
   $('<div></div>')
   .addClass('inner pane')
   .addClass(id)
   .attr('id', id)
   .css('top', `${$('.main').scrollTop()}px`)
   )

   setTimeout(() => {
   $(`#${id}`).addClass('active')
   $('.main .inner:not(.pane)').addClass('blur')
   $('.main').css('overflow-y', 'hidden')
   }, 0);

   $('.categories .category').on('click', () => {
   $(`#${id}`).remove()
   $('.main .inner').removeClass('blur')
   $('.main').css('overflow-y', 'scroll')
   })

   return id
   } */

/* function togglePane(id) {
   $(`#${id}`).toggleClass('active')
   $('.main .inner:not(.pane)').toggleClass('blur')
   $('.main').css('overflow-y', $('.main').css('overflow-y') == 'hidden' ? 'scroll' : 'hidden')
   } */

function updateTermTheme() {
	var getProp = (varname: string) => getComputedStyle(document.documentElement).getPropertyValue(varname).trim()
	term.setOption('theme', {
		background: getProp('--shade1'),
		black: getProp('--shade2'),
		blue: getProp('--accent5'),
		brightBlack: getProp('--shade3'),
		brightBlue: getProp('--accent5'),
		brightCyan: getProp('--accent4'),
		brightGreen: getProp('--accent3'),
		brightMagenta: getProp('--accent7'),
		brightRed: getProp('--accent0'),
		brightWhite: getProp('--shade7'),
		brightYellow: getProp('--accent2'),
		cursor: getProp('--shade1'),
		cursorAccent: getProp('--shade7'),
		cyan: getProp('--accent4'),
		foreground: getProp('--shade7'),
		green: getProp('--accent3'),
		magenta: getProp('--accent7'),
		red: getProp('--accent0'),
		selection: "#0000",
		white: getProp('--shade6'),
		yellow: getProp('--accent2')
	})
}

function gridSize(e: string) {
	$(e).each(function () {
		var el = $(this),
			width: number = el.outerWidth(),
			gridSize: number = Number(el.css('--grid-size')),
			gridGutter: number = Number(el.css('--grid-gutter').match(/\d+/)[0])

		el.css('grid-auto-rows', `${(width - (gridGutter * (gridSize - 1))) / gridSize}px`)
	})
}
