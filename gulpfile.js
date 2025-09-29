const del = require('del');

const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

// General
const concat = require('gulp-concat');
const flatmap = require('gulp-flatmap');
const lazypipe = require('lazypipe');
const merge = require('merge-stream');
const mergeJson = require('gulp-merge-json');
const wrap = require('gulp-wrap');
const { src, dest, series, task, watch, parallel } = require('gulp');

const browserSync = require('browser-sync');
const header = require('gulp-header');
const nodemon = require('nodemon');

// Source
const buffer = require('gulp-buffer');
const rollupStream = require('@rollup/stream');
const rollupTypescript = require('@rollup/plugin-typescript');
const source = require('vinyl-source-stream');

// HTML
const gulpHtmlmin = require('gulp-htmlmin');

// Scripts
const terser = require('gulp-terser');

// Styles
const minify = require('cssnano');
const postcss = require('gulp-postcss');
const prefix = require('autoprefixer');
const sass = require('gulp-sass')(require('sass'));

// Markdown-It
const cheerio = require('gulp-cheerio');
const markdownIt = require('gulp-markdownit');
const markdownitContainer = require('markdown-it-container');
const markdownitInlineComments = require('markdown-it-inline-comments');
const md = require('markdown-it')();

// Constants
const docsUrl =
    'https://zachowj.github.io/node-red-contrib-home-assistant-websocket';
const editorFilePath = 'dist';
const uiCssWrap = '<style><%= contents %></style>';
const uiJsWrap = '<script type="text/javascript"><%= contents %></script>';
const uiFormWrap =
    '<script type="text/html" data-template-name="<%= data.type %>"><%= data.contents %></script>';
const uiHelpWrap =
    '<script type="text/html" data-help-name="<%= data.type %>"><%= data.contents %></script>';
const uiHandlebarsWrap =
    '<script type="text/html" id="handlebars-<%= data.id %>" data-template-name="<%= data.type %>"><%= data.contents %></script>';
const resourcePath = 'resources/node-red-contrib-home-assistant-websocket';
const resourceFiles = [
    `<link rel="stylesheet" href="${resourcePath}/virtual-select.v1.0.44.min.css">`,
    `<script src="${resourcePath}/virtual-select.v1.0.44.min.js"></script>`,
    `<script src="${resourcePath}/handlebars.min-v4.7.8.js"></script>`,
];

const nodeMap = {
    action: { doc: 'action', type: 'api-call-service' },
    api: { doc: 'API', type: 'ha-api' },
    'binary-sensor': { doc: 'binary-sensor', type: 'ha-binary-sensor' },
    button: { doc: 'button', type: 'ha-button' },
    'config-server': { doc: 'config-server', type: 'server' },
    'current-state': { doc: 'current-state', type: 'api-current-state' },
    device: { doc: 'device', type: 'ha-device' },
    'device-config': { doc: 'device-config', type: 'ha-device-config' },
    entity: { doc: 'entity', type: 'ha-entity' },
    'entity-config': { doc: 'entity-config', type: 'ha-entity-config' },
    'events-all': { doc: 'events-all', type: 'server-events' },
    'events-calendar': { doc: 'events-calendar', type: 'ha-events-calendar' },
    'events-state': {
        doc: 'events-state',
        type: 'server-state-changed',
    },
    'fire-event': { doc: 'fire-event', type: 'ha-fire-event' },
    'get-entities': { doc: 'get-entities', type: 'ha-get-entities' },
    'get-history': { doc: 'get-history', type: 'api-get-history' },
    number: { doc: 'number', type: 'ha-number' },
    'poll-state': { doc: 'poll-state', type: 'poll-state' },
    'render-template': { doc: 'render-template', type: 'api-render-template' },
    select: { doc: 'select', type: 'ha-select' },
    sensor: { doc: 'sensor', type: 'ha-sensor' },
    sentence: { doc: 'sentence', type: 'ha-sentence' },
    switch: { doc: 'switch', type: 'ha-switch' },
    tag: { doc: 'tag', type: 'ha-tag' },
    text: { doc: 'text', type: 'ha-text' },
    time: { doc: 'time', type: 'ha-time' },
    'time-entity': { doc: 'time-entity', type: 'ha-time-entity' },
    'trigger-state': { doc: 'trigger-state', type: 'trigger-state' },
    'update-config': { doc: 'update-config', type: 'ha-update-config' },
    'wait-until': { doc: 'wait-until', type: 'ha-wait-until' },
    webhook: { doc: 'webhook', type: 'ha-webhook' },
    zone: { doc: 'zone', type: 'ha-zone' },
};

const editorMap = {
    'entity-filter': 'ha_entity_filter',
};

let nodemonInstance;
let browserSyncInstance;
let currentFilename;

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
            { type: nodeMap[currentFilename].type },
            { variable: 'data' },
        ),
    );

const buildEditor = lazypipe()
    .pipe(gulpHtmlmin, {
        collapseWhitespace: true,
        minifyCSS: true,
    })
    .pipe(() =>
        wrap(
            uiFormWrap,
            { type: editorMap[currentFilename] },
            { variable: 'data' },
        ),
    );

const buildSidebar = lazypipe()
    .pipe(gulpHtmlmin, {
        collapseWhitespace: true,
        minifyCSS: true,
    })
    .pipe(() => wrap(uiFormWrap, { type: 'ha_sidebar' }, { variable: 'data' }));

const buildSidebarToolbar = lazypipe()
    .pipe(gulpHtmlmin, {
        collapseWhitespace: true,
        minifyCSS: true,
    })
    .pipe(() =>
        wrap(uiFormWrap, { type: 'ha_sidebar_toolbar' }, { variable: 'data' }),
    );

const buildHandlebars = lazypipe()
    .pipe(gulpHtmlmin, {
        collapseWhitespace: false,
        minifyCSS: true,
    })
    .pipe(() =>
        wrap(
            uiHandlebarsWrap,
            { id: currentFilename, type: 'x-tmpl-handlebars' },
            { variable: 'data' },
        ),
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
                            return `<div class="home-assistant-custom-block ${
                                m[1]
                            }">\n<p class="custom-block-title">${md.utils.escapeHtml(
                                m[2] || title,
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
                .addClass('home-assistant-badge')
                .text(item.attribs.text || item.attribs.type);
            if (item.attribs.type) {
                $item.addClass(item.attribs.type);
            }

            return item;
        });
        $('docs-only, docsonly').remove();
        $('info-panel-only, infopanelonly').each((i, item) => {
            item.tagName = 'div';
            return item;
        });

        // Remove H1 title
        $('h1').remove();

        // increase header element by one to conform to Node-RED titles being <h3></h3>
        $('h2,h3,h4,h5').each(
            (i, item) => (item.tagName = `h${Number(item.tagName[1]) + 1}`),
        );

        // Change relative links to the full address of docs
        $('a').each((i, item) => {
            const $item = $(item);
            const href = $item.attr('href');
            if (href.startsWith('#')) {
                $item.replaceWith($item.text());
            } else if (href.startsWith('.') || href.startsWith('/')) {
                $item
                    .attr('href', `${docsUrl}${href.replace('.md', '.html')}`)
                    .attr('rel', 'noopener noreferrer');
            }
        });

        $('h3').each((i, item) => {
            const items = $(item).nextUntil('h3');
            items.wrapAll('<dl class="message-properties" />');
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
            { type: nodeMap[currentFilename].type },
            { variable: 'data' },
        ),
    );

task('buildEditorFiles', () => {
    const css = src([
        'src/editor/**/*.scss',
        'src/nodes/**/*.scss',
        '!_*.scss',
    ]).pipe(buildSass());

    let cache;
    const js = rollupStream({
        input: 'src/editor.ts',
        cache,
        output: {
            dir: editorFilePath,
            format: 'iife',
        },
        plugins: [
            rollupTypescript({
                tsconfig: 'tsconfig.editor.json',
            }),
        ],
        external: [],
    })
        .on('bundle', (bundle) => {
            cache = bundle;
        })
        .pipe(source('editor.ts'))
        .pipe(buffer())
        .pipe(buildJs());

    const editorsHtml = src(['src/editor/editors/*.html']).pipe(
        flatmap((stream, file) => {
            const [filename] = file.basename.split('.');

            currentFilename = filename;
            return stream.pipe(buildEditor());
        }),
    );

    const sidebarHtml = src(['src/editor/sidebar/index.html']).pipe(
        flatmap((stream, file) => {
            const [filename] = file.basename.split('.');

            currentFilename = filename;
            return stream.pipe(buildSidebar());
        }),
    );

    const sidebarToolbarHtml = src(['src/editor/sidebar/toolbar.html']).pipe(
        flatmap((stream, file) => {
            const [filename] = file.basename.split('.');

            currentFilename = filename;
            return stream.pipe(buildSidebarToolbar());
        }),
    );

    const handlebarsTemplates = src(['src/**/*.handlebars']).pipe(
        flatmap((stream, file) => {
            const [filename] = file.basename.split('.');

            currentFilename = filename;
            return stream.pipe(buildHandlebars());
        }),
    );

    const html = src([
        'src/nodes/**/*.html',
        `docs/node/*.md`,
        `!docs/node/index.md`,
    ]).pipe(
        flatmap((stream, file) => {
            const [filename, ext] = file.basename.split('.');

            if (ext === 'md') {
                const key = Object.keys(nodeMap).find(
                    (i) => nodeMap[i].doc === filename,
                );
                currentFilename = key;
                return stream.pipe(buildHelp());
            } else if (ext === 'html') {
                const [, node] = file.path.match(
                    /[\\/]src[\\/]nodes[\\/]([^\\/]+)[\\/]editor\.html/,
                );
                currentFilename = node;
                return stream.pipe(buildForm());
            }

            throw Error(`Expecting md or html extension: ${file.basename}`);
        }),
    );

    return merge([
        css,
        js,
        html,
        editorsHtml,
        sidebarHtml,
        sidebarToolbarHtml,
        handlebarsTemplates,
    ])
        .pipe(concat('index.html'))
        .pipe(header(resourceFiles.join('')))
        .pipe(dest(editorFilePath + '/'));
});

task('buildSourceFiles', () => {
    return tsProject.src().pipe(tsProject()).js.pipe(dest(editorFilePath));
});

task('copyIcons', () => {
    return src('icons/*').pipe(dest(`${editorFilePath}/icons`));
});

task('copyLocales', () => {
    return src('locales/**/*').pipe(dest(`${editorFilePath}/locales`));
});

task('buildLocalLocales', () => {
    return src('src/**/locale.json')
        .pipe(mergeJson({ fileName: 'index.json' }))
        .pipe(dest(`${editorFilePath}/locales/en-US`));
});

task('copyAssetFiles', parallel(['copyIcons', 'copyLocales']));

task(
    'buildAll',
    parallel([
        'buildEditorFiles',
        'buildSourceFiles',
        series(['copyAssetFiles', 'buildLocalLocales']),
    ]),
);

// Clean generated files
task('cleanAssetFiles', (done) => {
    del.sync(['dist/icons', 'dist/locales']);

    done();
});

task('cleanSourceFiles', (done) => {
    del.sync(['dist/helpers', 'dist/homeAssistant', 'dist/nodes', 'dist/*.js']);

    done();
});

task('cleanEditorFiles', (done) => {
    del.sync(['dist/index.html']);

    done();
});

task(
    'cleanAllFiles',
    parallel(['cleanAssetFiles', 'cleanSourceFiles', 'cleanEditorFiles']),
);

// nodemon and browser-sync code modified from
// https://github.com/connio/node-red-contrib-connio/blob/master/gulpfile.js
function runNodemonAndBrowserSync(done) {
    const yargs = require('yargs/yargs');
    const { hideBin } = require('yargs/helpers');
    const { dir } = yargs(hideBin(process.argv)).parseSync();

    nodemonInstance = nodemon(`
        nodemon
        --ignore **/*
        --exec node-red -u ${dir ?? process.env.NODE_RED_DEV_DIR ?? '.node-red'}
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
                reloadDelay: 4000,
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
    build: series('cleanAllFiles', 'buildAll'),

    start: series(
        'cleanAllFiles',
        'buildAll',
        runNodemonAndBrowserSync,
        function watcher(done) {
            watch(
                [
                    'docs/node/*.md',
                    'src/nodes/**/editor/*',
                    'src/nodes/**/editor.*',
                    'src/nodes/**/migrations.ts',
                    'src/editor/**/*',
                    'src/editor.ts',
                ],
                series(
                    'cleanEditorFiles',
                    'buildEditorFiles',
                    restartNodemonAndBrowserSync,
                ),
            );
            // only server side files modified restart node-red only
            watch(
                [
                    'src/**/*.js',
                    'src/**/*.ts',
                    '!src/nodes/**/editor.*',
                    '!src/nodes/**/editor/*',
                    '!src/editor.ts',
                ],
                series('cleanSourceFiles', 'buildSourceFiles', restartNodemon),
            );
            watch(
                'src/**/locale.json',
                series('buildLocalLocales', restartNodemonAndBrowserSync),
            );
            done();
        },
    ),
};
