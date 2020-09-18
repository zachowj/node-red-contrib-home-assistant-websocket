const del = require('del');
const fs = require('fs');
const path = require('path');

// General
const concat = require('gulp-concat');
const gulpIf = require('gulp-if');
const lazypipe = require('lazypipe');
const merge = require('merge-stream');
const wrap = require('gulp-wrap');
const { src, dest, series, task, watch } = require('gulp');

const browserSync = require('browser-sync');
const nodemon = require('nodemon');

// HTML
const gulpHtmlmin = require('gulp-htmlmin');

// Scripts
const terser = require('gulp-terser');

// Styles
const minify = require('cssnano');
const postcss = require('gulp-postcss');
const prefix = require('autoprefixer');
const sass = require('gulp-sass');

// Markdown-It
const cheerio = require('gulp-cheerio');
const markdownIt = require('gulp-markdownit');
const markdownitContainer = require('markdown-it-container');
const markdownitInlineComments = require('markdown-it-inline-comments');
const md = require('markdown-it')();

// Constants
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
    entity: { doc: 'entity', type: 'ha-entity' },
    'events-all': { doc: 'events-all', type: 'server-events' },
    'events-state-changed': {
        doc: 'events-state',
        type: 'server-state-changed',
    },
    'fire-event': { doc: 'fire-event', type: 'ha-fire-event' },
    'get-entities': { doc: 'get-entities', type: 'ha-get-entities' },
    'get-history': { doc: 'get-history', type: 'api-get-history' },
    'poll-state': { doc: 'poll-state', type: 'poll-state' },
    'render-template': { doc: 'get-template', type: 'api-render-template' },
    'trigger-state': { doc: 'trigger-state', type: 'trigger-state' },
    'wait-until': { doc: 'wait-until', type: 'ha-wait-until' },
    webhook: { doc: 'webhook', type: 'ha-webhook' },
    zone: { doc: 'zone', type: 'ha-zone' },
};

let nodemonInstance;
let browserSyncInstance;
let currentFolder;

function getFolders(dir) {
    return fs.readdirSync(dir).filter(function (file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

// Compile sass and wrap it
const buildSass = lazypipe()
    .pipe(sass, {
        outputStyle: 'expanded',
        sourceComments: true,
    })
    .pipe(postcss, [
        prefix({
            cascade: true,
            remove: true,
        }),
        minify({
            discardComments: {
                removeAll: true,
            },
        }),
    ])
    .pipe(wrap, uiCssWrap);

// Shrink js and wrap it
const buildJs = lazypipe().pipe(terser).pipe(wrap, uiJsWrap);

const buildForm = lazypipe()
    .pipe(gulpHtmlmin, {
        collapseWhitespace: true,
        minifyCSS: true,
    })
    .pipe(() =>
        wrap(
            uiFormWrap,
            { type: nodeMap[currentFolder].type },
            { variable: 'data' }
        )
    );

// Covert markdown documentation to html and modify it to look more like Node-RED
// help files.
const buildHelp = lazypipe()
    .pipe(markdownIt, {
        options: { html: true },
        plugins: [
            [
                markdownitContainer,
                'vuepress-custom-container',
                {
                    validate: function (params) {
                        return params
                            .trim()
                            .match(/^(?:tip|warning|danger)\s?(.*)$/);
                    },

                    render: function (tokens, idx) {
                        const m = tokens[idx].info
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
                    },
                },
            ],
            markdownitInlineComments,
        ],
    })
    .pipe(cheerio, ($) => {
        $.prototype.wrapAll = function (wrapper) {
            const $container = $(wrapper).clone();
            $(this).eq(0).before($container);

            for (const i in this) {
                const clone = $(this).eq(i).clone();
                $container.append($('<div>' + clone + '</div>').html());
                $(this).eq(i).remove();
            }
        };

        // Make things look more like Node-RED docs.

        // Handle <badge />
        $('badge').each((i, item) => {
            item.tagName = 'span';
            const $item = $(item)
                .addClass('badge')
                .text(item.attribs.text || item.attribs.type);
            if (item.attribs.type) {
                $item.addClass(item.attribs.type);
            }

            return item;
        });

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
            const li = $(item).next().find('li').eq(0);

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
        minifyCSS: true,
    })
    .pipe(() =>
        wrap(
            uiHelpWrap,
            { type: nodeMap[currentFolder].type },
            { variable: 'data' }
        )
    );

task('buildEditorFiles', (done) => {
    const folders = getFolders(editorFilePath);
    if (folders.length === 0) return done();

    const tasks = folders.map((folder) => {
        currentFolder = folder;
        return src([
            'lib/ui/*',
            `nodes/${folder}/ui-*.js`,
            `nodes/${folder}/ui-*.html`,
            `docs/node/${nodeMap[folder].doc}.md`,
        ])
            .pipe(gulpIf((file) => file.extname === '.scss', buildSass()))
            .pipe(gulpIf((file) => file.extname === '.js', buildJs()))
            .pipe(gulpIf((file) => file.extname === '.html', buildForm()))
            .pipe(gulpIf((file) => file.extname === '.md', buildHelp()))
            .pipe(concat(folder + '.html'))
            .pipe(dest(editorFilePath + '/' + folder));
    });

    return merge(tasks);
});

// Clean generated files
task('cleanFiles', (done) => {
    del.sync(['nodes/*/*.html', '!nodes/*/ui-*.html'], { onlyFiles: true });

    return done();
});

// nodemon and browser-sync code modified from
// https://github.com/connio/node-red-contrib-connio/blob/master/gulpfile.js
function runNodemonAndBrowserSync(done) {
    nodemonInstance = nodemon(`
    nodemon
    --ignore **/*
    --exec node-red -u ~/.node-red
  `);

    nodemon
        .once('start', () => {
            browserSyncInstance = browserSync.create();
            browserSyncInstance.init({
                ui: false,
                proxy: {
                    target: 'http://localhost:1880',
                    ws: true,
                },
                ghostMode: false,
                open: false,
                reloadDelay: 3000,
            });
        })
        .on('quit', () => process.exit(0));

    done();
}

function restartNodemon(done) {
    nodemonInstance.restart();

    done();
}
function restartNodemonAndBrowserSync(done) {
    nodemonInstance.restart();
    browserSyncInstance.reload();

    done();
}

module.exports = {
    build: series('cleanFiles', 'buildEditorFiles'),

    start: series(
        'cleanFiles',
        'buildEditorFiles',
        runNodemonAndBrowserSync,
        function watcher(done) {
            watch(
                ['lib/common/*', 'nodes/*/ui-*', 'docs/node/*.md'],
                series(
                    'cleanFiles',
                    'buildEditorFiles',
                    restartNodemonAndBrowserSync
                )
            );
            // only server side files modified restart node-red only
            watch(
                ['nodes/*/*.js', '!nodes/*/ui-*.js', 'lib/*.js'],
                restartNodemon
            );
            done();
        }
    ),
};
