const cheerio = require('cheerio');
const fs = require('fs');
const md = require('markdown-it')();
const prettier = require('prettier');
const replace = require('replace-in-file');

const docsUrl =
    'https://zachowj.github.io/node-red-contrib-home-assistant-websocket';

md.use(require('markdown-it-container'), 'vuepress-custom-container', {
    validate: function(params) {
        return params.trim().match(/^(?:tip|warning|danger)\s?(.*)$/);
    },

    render: function(tokens, idx) {
        var m = tokens[idx].info.trim().match(/^(tip|warning|danger)\s?(.*)$/);

        if (tokens[idx].nesting === 1) {
            let title = 'INFO';
            switch (m[1]) {
                case 'warning':
                case 'danger':
                    title = 'WARNING';
                    break;
            }

            // opening tag
            return `<div class="custom-block ${
                m[1]
            }">\n<p class="custom-block-title">${md.utils.escapeHtml(
                m[2] || title
            )}</p>\n`;
        } else {
            // closing tag
            return '</div>\n';
        }
    }
});

const files = {
    API: 'api',
    'call-service': 'call-service',
    'current-state': 'current-state',
    sensor: 'entity',
    'events-all': 'events-all',
    'events-state': 'events-state-changed',
    'fire-event': 'fire-event',
    'get-entities': 'get-entities',
    'get-history': 'get-history',
    'poll-state': 'poll-state',
    'get-template': 'render-template',
    'trigger-state': 'trigger-state',
    'wait-until': 'wait-until',
    webhook: 'webhook'
};

function plugins($) {
    $.prototype.wrapAll = function(wrapper) {
        var $container = $(wrapper).clone();
        $(this)
            .eq(0)
            .before($container);

        for (var i in this) {
            var clone = $(this)
                .eq(i)
                .clone();
            $container.append($('<div>' + clone + '</div>').html());
            $(this)
                .eq(i)
                .remove();
        }
    };
}

for (const file in files) {
    let contents = fs.readFileSync(
        `../node-red-contrib-home-assistant-websocket/docs/node/${file}.md`,
        'utf8'
    );

    contents = contents
        .replace(/<Badge text="(.+)"\/>/g, '(**$1**)')
        // Remove Comments
        .replace(/<!--.*-->/g, '');

    const html = md.render(contents);

    const $ = cheerio.load(html);
    plugins($);

    // Make things look more like Node-RED docs.

    // Remove H1 title
    $('h1').remove();

    // increase header element by one to conform to Node-RED titles being <h3></h3>
    $('h2,h3,h4,h5,h6').each(
        (i, item) => (item.tagName = `h${Number(item.tagName[1]) + 1}`)
    );

    // Change relative links to the full address of docs
    $('a').each((i, item) => {
        const href = $(item).attr('href');
        if (href.startsWith('.') || href.startsWith('/')) {
            $(item).attr('href', `${docsUrl}${href.replace('.md', '.html')}`);
        }
    });

    $('h3').each((i, item) => {
        const h3 = $(item);
        const items = h3.nextUntil('h3');
        // Remove Changelog from the end of the file
        if (h3.text().toLowerCase() !== 'Changelog'.toLowerCase()) {
            items.wrapAll('<dl class="message-properties" />');
        } else {
            h3.remove();
            items.remove();
        }
    });

    // Convert <p> inside <dl> to <dd>
    $('p')
        .filter((i, item) => item.parent.name === 'dl')
        .each((i, item) => (item.tagName = 'dd'));

    // h4 is the property name and the first li will contain the type
    // Pattern: h4 > ul > li
    $('h4').each((i, item) => {
        const li = $(item)
            .next()
            .find('li')
            .eq(0);

        const property = li.find('code').text();
        $(item).append(`<span class="property-type">${property}</span>`);
        li.remove();
        item.tagName = 'dt';
        return item;
    });

    // Remove empty <ul></ul>
    $('ul').each((i, item) => {
        if ($(item).find('li').length === 0) {
            $(item).remove();
        }
    });

    const renderedHtml = prettier.format($.root().html(), {
        parser: 'html',
        tabWidth: 2,
        singleQuote: false
    });

    // Replace old node help text with new
    const options = {
        files: `nodes/${files[file]}/${files[file]}.html`,
        from: /<script type="text\/x-red" data-help-name="(\S+)">.*<\/script>/gs,
        to: (_, match) => {
            return `<script type="text/x-red" data-help-name="${match}">${renderedHtml}</script>`;
        }
    };
    try {
        replace.sync(options);
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}
