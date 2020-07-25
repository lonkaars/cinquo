var cheerio = require('cheerio')

module.exports.generateTiles = (json, config) => {
    var tiles = []
    for (let i = 0; i < json.length; i++) {
        // Create new element
        var $ = cheerio.load('<div class="panel"></div>');
        $('.panel')
            .addClass(`tile-id-${json[i].id}`);
        if (json[i].display.dark == true) $('.panel').addClass('dark');

        // Title
        $('.panel').append(
            $('<p></p>')
            .addClass('name')
            .text(json[i].name)
        );

        // Icon
        if (json[i].type != 'slider') {
            if (json[i].icon.type == 'material-icon') {
                $('.panel').append(
                    $('<i></i>')
                    .addClass("material-icons-round icon")
                    .text(json[i].icon.value)
                );
            } else if (json[i].icon.type == 'image') {
                $('.panel').append(
                    $('<div></div>')
                    .addClass("icon")
                    .css({
                        "background": `url(${json[i].icon.value})`,
                        "background-size": 'cover'
                    })
                );
            }
        }

        // Slider
        if (json[i].type == 'slider') {
            $('.panel').addClass('withSlider');
            $('.panel').append(
                $('<input></input>')
                .addClass(`slider slider-id-${json[i].id}`)
                .attr({
                    type: 'range',
                    step: '0.01',
                    oninput: `slider('.slider-id-${json[i].id}')`,
                    onclick: `slider('.slider-id-${json[i].id}')`,
                    onchange: `slider('.slider-id-${json[i].id}')`,
                    min: json[i].min ? json[i].min : 0,
                    max: json[i].max ? json[i].max : 0
                })
            );

            // Slider value
            if (json[i].display.displaySliderValue == true) $('.panel').append(
                $('<p></p>')
                .addClass(`value slider-id-${json[i].id}`)
                .text(json[i].min != undefined && json[i].max != undefined ? Math.floor((json[i].min + json[i].max) / 2) : 50)
            );
        }

        // Toggle
        if (json[i].type == 'toggle') {
            $('.panel')
                .addClass('toggle')
                .html(
                    $('<div></div>')
                    .addClass('status')
                )
                .attr({
                    onclick: `button('.tile-id-${json[i].id}')`
                });
        }

        // Button
        if (json[i].type == 'button') {
            $('.panel')
                .attr({
                    onclick: `button('.tile-id-${json[i].id}')`
                })
        }

        // Size and shape
        var size = json[i].where.w * json[i].where.h
        if (size <= 3) $('.panel').addClass('small')
        if (size >= 4 && size <= 8) $('.panel').addClass('medium')
        if (size >= 9) $('.panel').addClass('large')

        if (json[i].where.w > json[i].where.h) $('.panel').addClass('long')
        if (json[i].where.w < json[i].where.h) $('.panel').addClass('tall')

        // Background
        if (json[i].display.type == 'solid') {
            $('.panel').css('background', json[i].display.value)
        } else if (json[i].display.type == 'gradient') {
            var gradient = `linear-gradient(${json[i].display.value.rotation + 180}deg, `
            for (let j = 0; j < json[i].display.value.colors.length; j++) {
                var pos = (100 / (json[i].display.value.colors.length - 1)) * j
                gradient += `${json[i].display.value.colors[j]} ${pos}%${j + 1 != json[i].display.value.colors.length ? ', ' : ''}`
            }
            gradient += ')'
            $('.panel').css('background', gradient)
        } else if (json[i].display.type == 'image') {
            $('.panel').css({
                'background': `url(${json[i].display.value})`,
                'background-size': 'contain'
            })
        }

        // Position
        $('.panel').css({
            'grid-column': `${json[i].where.x + 1}/${json[i].where.x + 1 + json[i].where.w}`,
            'grid-row': `${json[i].where.y + 1}/${json[i].where.y + 1 + json[i].where.h}`
        })

        // Add to tiles
        tiles.push($('body').html())

        // Glow
        if (config.blurFx == true) {
            $('.panel').html('')
                .removeClass(`dark large medium small tall long tile-id-${json[i].id}`)
                .removeAttr('onclick')
                .addClass('blurBG');
            tiles.push($('body').html())
        }
    }
    return tiles.join('\n')
}