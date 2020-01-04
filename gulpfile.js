const fs = require('fs');
const path = require('path');
const { src, dest, series } = require('gulp');
const cheerio = require('gulp-cheerio');
const concat = require('gulp-concat');
const markdownIt = require('gulp-markdownit');
const gulpHtmlmin = require('gulp-htmlmin');
const gulpIf = require('gulp-if');
const lazypipe = require('lazypipe');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const replace = require('gulp-string-replace');
const terser = require('gulp-terser');
const wrap = require('gulp-wrap');

const md = require('markdown-it')();
const markdownitContainer = require('markdown-it-container');
const markdownitInlineComments = require('markdown-it-inline-comments');

const docsUrl =
    'https://zachowj.github.io/node-red-contrib-home-assistant-websocket';
const editorFilePath = 'nodes';
const uiCssWrap = '<style><%= contents %></style>';
const uiJsWrap = '<script type="text/javascript"><%= contents %></script>';
const uiFormWrap =
    '<script type="text/x-red" data-template-name="<%= data.type %>"><%= data.contents %></script>';
const uiHelpWrap =
    '<script type="text/x-red" data-help-name="<%= data.type %>"><%= data.contents %></script>';

const nodeMap = {
    api: { doc: 'API', type: 'ha-api' },
    'call-service': { doc: 'call-service', type: 'api-call-service' },
    'config-server': { doc: 'config-server', type: 'server' },
    'current-state': { doc: 'current-state', type: 'api-current-state' },
    entity: { doc: 'sensor', type: 'ha-entity' },
    'events-all': { doc: 'events-all', type: 'server-events' },
    'events-state-changed': {
        doc: 'events-state',
        type: 'server-state-changed'
    },
    'fire-event': { doc: 'fire-event', type: 'ha-fire-event' },
    'get-entities': { doc: 'get-entities', type: 'ha-get-entities' },
    'get-history': { doc: 'get-history', type: 'api-get-history' },
    'poll-state': { doc: 'poll-state', type: 'poll-state' },
    'render-template': { doc: 'get-template', type: 'api-render-template' },
    'trigger-state': { doc: 'trigger-state', type: 'trigger-state' },
    'wait-until': { doc: 'wait-until', type: 'ha-wait-until' },
    webhook: { doc: 'webhook', type: 'ha-webhook' }
};

function getFolders(dir) {
    return fs.readdirSync(dir).filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

const buildCss = lazypipe()
    .pipe(gulpHtmlmin, {
        collapseWhitespace: true,
        minifyCSS: true
    })
    .pipe(wrap, uiCssWrap);

const buildJs = lazypipe()
    .pipe(terser)
    .pipe(wrap, uiJsWrap);

const buildForm = lazypipe().pipe(gulpHtmlmin, {
    collapseWhitespace: true,
    minifyCSS: true
});

const buildHelp = lazypipe()
    .pipe(replace, /<Badge text="(.+)"\/>/g, '')
    .pipe(markdownIt, {
        plugins: [
            [
                markdownitContainer,
                'vuepress-custom-container',
                {
                    validate: function(params) {
                        return params
                            .trim()
                            .match(/^(?:tip|warning|danger)\s?(.*)$/);
                    },

                    render: function(tokens, idx) {
                        var m = tokens[idx].info
                            .trim()
                            .match(/^(tip|warning|danger)\s?(.*)$/);

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
                }
            ],
            markdownitInlineComments
        ]
    })
    .pipe(cheerio, ($, file) => {
        $.prototype.wrapAll = function(wrapper) {
            const $container = $(wrapper).clone();
            $(this)
                .eq(0)
                .before($container);

            for (const i in this) {
                const clone = $(this)
                    .eq(i)
                    .clone();
                $container.append($('<div>' + clone + '</div>').html());
                $(this)
                    .eq(i)
                    .remove();
            }
        };

        // Make things look more like Node-RED docs.

        // Remove H1 title
        $('h1').remove();

        // increase header element by one to conform to Node-RED titles being <h3></h3>
        $('h2,h3,h4,h5').each(
            (i, item) => (item.tagName = `h${Number(item.tagName[1]) + 1}`)
        );

        // Change relative links to the full address of docs
        $('a').each((i, item) => {
            const href = $(item).attr('href');
            if (href.startsWith('.') || href.startsWith('/')) {
                $(item)
                    .attr('href', `${docsUrl}${href.replace('.md', '.html')}`)
                    .attr('rel', 'noopener noreferrer');
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
        $('dl > p').each((i, item) => (item.tagName = 'dd'));

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
    })
    .pipe(gulpHtmlmin, {
        collapseWhitespace: true,
        minifyCSS: true
    })
    .pipe(rename, path => {
        path.extname = '.md';
    });

const buildEditorFiles = done => {
    const folders = getFolders(editorFilePath);
    if (folders.length === 0) return done();

    const tasks = folders.map(folder => {
        return src([
            'lib/_static/*',
            `nodes/${folder}/ui-*.js`,
            `nodes/${folder}/ui-*.html`,
            `docs/node/${nodeMap[folder].doc}.md`
        ])
            .pipe(gulpIf(file => file.extname === '.css', buildCss()))
            .pipe(gulpIf(file => file.extname === '.js', buildJs()))
            .pipe(gulpIf(file => file.extname === '.html', buildForm()))
            .pipe(gulpIf(file => file.extname === '.md', buildHelp()))
            .pipe(
                gulpIf(
                    file => file.extname === '.html',
                    wrap(
                        uiFormWrap,
                        { type: nodeMap[folder].type },
                        { variable: 'data' }
                    )
                )
            )
            .pipe(
                gulpIf(
                    file => file.extname === '.md',
                    wrap(
                        uiHelpWrap,
                        { type: nodeMap[folder].type },
                        { variable: 'data' }
                    )
                )
            )
            .pipe(concat(folder + '.html'))
            .pipe(dest(editorFilePath + '/' + folder));
    });

    return merge(tasks);
};

exports.build = series(buildEditorFiles);
