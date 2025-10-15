const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync');
const cheerio = require('cheerio');
const chokidar = require('chokidar');
const cssnano = require('cssnano');
const del = require('del');
const esbuild = require('esbuild');
const fastGlob = require('fast-glob');
const fs = require('fs').promises;
const htmlMinifier = require('html-minifier');
const markdownIt = require('markdown-it');
const markdownitContainer = require('markdown-it-container');
const markdownitInlineComments = require('markdown-it-inline-comments');
const mergeJson = require('merge-json');
const path = require('path');
const postcss = require('postcss');
const sass = require('sass');
const { spawn } = require('child_process');

// Constants
const DOCS_URL =
    'https://zachowj.github.io/node-red-contrib-home-assistant-websocket';
const DOCS_DIR = 'docs';
const DIST_DIR = 'dist';
const ICONS_DIR = 'icons';
const LOCALES_DIR = 'locales';
const RESOURCES_DIR = 'resources';
const SRC_DIR = 'src';
const RESOURCE_PATH = 'resources/node-red-contrib-home-assistant-websocket';
const RESOURCE_FILES = [
    `<link rel="stylesheet" href="${RESOURCE_PATH}/virtual-select.v1.0.44.min.css">`,
    `<script src="${RESOURCE_PATH}/virtual-select.v1.0.44.min.js"></script>`,
    `<script src="${RESOURCE_PATH}/handlebars.min-v4.7.8.js"></script>`,
];

// NodeMap key is the directory name of the node, doc is the markdown file name (without .md), type is the Node-RED node type
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

// Editor HTML templates that are not tied to a specific node
const editorMap = {
    'entity-filter': 'ha_entity_filter',
};

// Build cache to store processed results
const buildCache = {
    scss: null,
    html: null,
    editorsHtml: null,
    markdown: null,
    sidebar: null,
    sidebarToolbar: null,
    handlebars: null,
};

const invalidateCache = (types) => {
    types.forEach((type) => {
        buildCache[type] = null;
    });
};

const buildScss = async () => {
    if (buildCache.scss) return buildCache.scss;

    const scssFiles = await fastGlob([
        `${SRC_DIR}/editor/**/*.scss`,
        `${SRC_DIR}/nodes/**/*.scss`,
    ]);
    buildCache.scss = await compileSass(scssFiles);
    return buildCache.scss;
};

const buildNodeHtml = async (isDevMode) => {
    if (buildCache.html) return buildCache.html;

    const htmlFiles = await fastGlob([`${SRC_DIR}/nodes/**/*.html`]);
    const htmlPromises = htmlFiles.map(async (file) => {
        const html = await fs.readFile(file, 'utf-8');
        const minifiedHtml = isDevMode ? html : minifyHtml(html);

        const nodeName = path.basename(path.dirname(file));
        const nodeType = nodeMap[nodeName]?.type;
        if (!nodeType) {
            throw new Error(`Node type not found for HTML file: ${file}`);
        }

        return `<script type="text/html" data-template-name="${nodeType}">${minifiedHtml}</script>`;
    });

    buildCache.html = await Promise.all(htmlPromises);
    return buildCache.html;
};

const buildEditorsHtml = async (isDevMode) => {
    if (buildCache.editorsHtml) return buildCache.editorsHtml;

    const editorsHtmlFiles = await fastGlob([
        `${SRC_DIR}/editor/editors/*.html`,
    ]);
    const editorsHtmlPromises = editorsHtmlFiles.map(async (file) => {
        const html = await fs.readFile(file, 'utf-8');
        const minifiedHtml = isDevMode ? html : minifyHtml(html);

        const filename = path.basename(file, path.extname(file));
        return `<script type="text/html" data-template-name="${editorMap[filename]}">${minifiedHtml}</script>`;
    });

    buildCache.editorsHtml = await Promise.all(editorsHtmlPromises);
    return buildCache.editorsHtml;
};

const buildMarkdown = async (isDevMode) => {
    if (buildCache.markdown) return buildCache.markdown;

    const markdownFiles = await fastGlob([`docs/node/*.md`], {
        ignore: ['docs/node/index.md'],
    });
    const markdownPromises = markdownFiles.map(async (file) => {
        const markdown = await fs.readFile(file, 'utf-8');
        const nodeName = path.basename(file, path.extname(file)).toLowerCase();
        const nodeType = nodeMap[nodeName]?.type;

        if (!nodeType) {
            throw new Error(`Node type not found for MD file: ${file}`);
        }

        const html = processMarkdown(markdown);
        const processedHtml = processHtmlWithCheerio(html);
        const minifiedHtml = isDevMode
            ? processedHtml
            : minifyHtml(processedHtml);
        return `<script type="text/html" data-help-name="${nodeType}">${minifiedHtml}</script>`;
    });

    buildCache.markdown = await Promise.all(markdownPromises);
    return buildCache.markdown;
};

const buildSidebarCached = async () => {
    if (buildCache.sidebar) return buildCache.sidebar;
    buildCache.sidebar = await buildSidebar();
    return buildCache.sidebar;
};

const buildSidebarToolbarCached = async () => {
    if (buildCache.sidebarToolbar) return buildCache.sidebarToolbar;
    buildCache.sidebarToolbar = await buildSidebarToolbar();
    return buildCache.sidebarToolbar;
};

const buildHandlebarsCached = async () => {
    if (buildCache.handlebars) return buildCache.handlebars;

    const handlebarsFiles = await fastGlob([`${SRC_DIR}/**/*.handlebars`]);
    const handlebarsPromises = handlebarsFiles.map((file) =>
        buildHandlebars(file),
    );
    buildCache.handlebars = await Promise.all(handlebarsPromises);
    return buildCache.handlebars;
};

// Utility Functions
const clean = async (patterns) => {
    console.time(`Cleaning: ${patterns}`);
    await del(patterns);
    console.timeEnd(`Cleaning: ${patterns}`);
};

const compileSass = async (scssFiles) => {
    const cssPromises = scssFiles.map(async (file) => {
        const result = sass.compile(file);
        const processed = await postcss([
            autoprefixer({ cascade: true, remove: true }),
            cssnano({
                preset: ['default', { discardComments: { removeAll: true } }],
            }),
        ]).process(result.css, { from: undefined });
        return processed.css;
    });
    const compiledCss = await Promise.all(cssPromises);
    return `<style>${compiledCss.join('')}</style>`;
};

const minifyHtml = (html) => {
    const minified = htmlMinifier.minify(html, {
        collapseWhitespace: true,
        minifyCSS: true,
    });

    return minified;
};

const copyFiles = async (srcDir, destDir) => {
    await fs.mkdir(destDir, { recursive: true });
    const files = await fs.readdir(srcDir);
    await Promise.all(
        files.map(async (file) => {
            const srcPath = path.join(srcDir, file);
            const destPath = path.join(destDir, file);
            const stat = await fs.stat(srcPath);
            if (stat.isDirectory()) {
                await copyFiles(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }),
    );
};

const processHtmlWithCheerio = (html) => {
    const $ = cheerio.load(html, {}, false);

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
        if (href?.startsWith('#')) {
            $item.replaceWith($item.text());
        } else if (href?.startsWith('.') || href?.startsWith('/')) {
            $item
                .attr('href', `${DOCS_URL}${href.replace('.md', '.html')}`)
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

    return $.html();
};

const processMarkdown = (markdown) => {
    const md = markdownIt({
        html: true,
    })
        .use(markdownitContainer, 'vuepress-custom-container', {
            validate: (params) =>
                params.trim().match(/^(?:tip|warning|danger)\s?(.*)$/),
            render: (tokens, idx) => {
                const m = tokens[idx].info
                    .trim()
                    .match(/^(tip|warning|danger)\s?(.*)$/);

                if (tokens[idx].nesting === 1) {
                    let title = 'INFO';
                    if (m[1] === 'warning' || m[1] === 'danger') {
                        title = 'WARNING';
                    }
                    return `<div class="home-assistant-custom-block ${
                        m[1]
                    }">\n<p class="custom-block-title">${md.utils.escapeHtml(
                        m[2] || title,
                    )}</p>\n`;
                } else {
                    return '</div>\n';
                }
            },
        })
        .use(markdownitInlineComments);

    return md.render(markdown);
};

const buildEditorFiles = async () => {
    const isDevMode = process.argv[2] === 'start';

    // Build all components in parallel, using cache when available
    const [
        css,
        js,
        html,
        editorsHtml,
        markdown,
        sidebar,
        sidebarToolbar,
        handlebars,
    ] = await Promise.all([
        buildScss(),
        esbuild.build({
            entryPoints: [`${SRC_DIR}/editor.ts`],
            write: false,
            bundle: true,
            minify: !isDevMode,
            format: 'iife',
            tsconfig: path.resolve(__dirname, 'tsconfig.editor.json'),
        }),
        buildNodeHtml(isDevMode),
        buildEditorsHtml(isDevMode),
        buildMarkdown(isDevMode),
        buildSidebarCached(),
        buildSidebarToolbarCached(),
        buildHandlebarsCached(),
    ]);

    const combinedHtml = [
        ...RESOURCE_FILES,
        css,
        ...html,
        ...markdown,
        ...editorsHtml,
        sidebar,
        sidebarToolbar,
        ...handlebars,
        `<script type="text/javascript">${js.outputFiles[0].text}</script>`,
    ].join('\n');

    await fs.writeFile(`${DIST_DIR}/index.html`, combinedHtml);
};

const buildSourceFiles = async () => {
    const isDevMode = process.argv[2] === 'start'; // Check if the command is 'start'

    const tsconfig = JSON.parse(
        await fs.readFile(path.resolve(__dirname, 'tsconfig.json'), 'utf-8'),
    );
    const includePatterns = tsconfig.include || [];
    const excludePatterns = tsconfig.exclude || [];
    const entryPoints = await fastGlob(includePatterns, {
        ignore: excludePatterns,
    });

    await esbuild.build({
        entryPoints,
        outdir: DIST_DIR,
        bundle: false,
        minify: true,
        platform: 'node',
        format: 'cjs',
        sourcemap: isDevMode, // Enable source maps in dev mode
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    });
};

// Track which icon files were copied to avoid redundant operations
const copiedIcons = new Set();

const copyIconFile = async (iconPath) => {
    const relativePath = path.relative(ICONS_DIR, iconPath);
    const destPath = path.join(`${DIST_DIR}/icons`, relativePath);

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(iconPath, destPath);

    copiedIcons.add(iconPath);
    console.log(`Copied icon: ${relativePath}`);
};

const copyIcons = async (changedFiles = null) => {
    if (changedFiles && changedFiles.length > 0) {
        // Only copy the specific changed icon files
        await Promise.all(
            changedFiles
                .filter((file) => file.startsWith(ICONS_DIR))
                .map((file) => copyIconFile(file)),
        );
    } else {
        // Full copy on initial build
        await copyFiles(ICONS_DIR, `${DIST_DIR}/icons`);
        copiedIcons.clear();
    }
};

const copyLocales = async () => {
    await copyFiles(LOCALES_DIR, `${DIST_DIR}/locales`);
};

const buildLocales = async () => {
    const localeFiles = await fastGlob([`${SRC_DIR}/**/locale.json`]);
    const mergedLocales = await localeFiles.reduce(async (accPromise, file) => {
        const acc = await accPromise;
        const content = JSON.parse(await fs.readFile(file, 'utf-8'));
        return mergeJson.merge(acc, content);
    }, Promise.resolve({}));

    await fs.writeFile(
        `${DIST_DIR}/locales/en-US/index.json`,
        JSON.stringify(mergedLocales),
    );
};

const buildSidebar = async () => {
    const html = await fs.readFile(
        `${SRC_DIR}/editor/sidebar/index.html`,
        'utf-8',
    );
    const minifiedHtml = minifyHtml(html);
    return `<script type="text/html" data-template-name="ha_sidebar">${minifiedHtml}</script>`;
};

const buildSidebarToolbar = async () => {
    const html = await fs.readFile(
        `${SRC_DIR}/editor/sidebar/toolbar.html`,
        'utf-8',
    );
    const minifiedHtml = minifyHtml(html);
    return `<script type="text/html" data-template-name="ha_sidebar_toolbar">${minifiedHtml}</script>`;
};

const buildHandlebars = async (file) => {
    const html = await fs.readFile(file, 'utf-8');
    const minifiedHtml = minifyHtml(html);
    const id = path.basename(file, path.extname(file));
    return `<script type="text/html" id="handlebars-${id}" data-template-name="x-tmpl-handlebars">${minifiedHtml}</script>`;
};

let nodeRedProcess;

// Function to start Node-RED
const startNodeRed = (dir) => {
    const nodeRedDir = dir ?? process.env.NODE_RED_DEV_DIR ?? '.node-red';
    const nodeRedBinary = path.resolve(
        __dirname,
        './node_modules/node-red/red.js',
    ); // Reference the Node-RED entry script

    nodeRedProcess = spawn(
        'node',
        [
            '--trace-deprecation',
            '--enable-source-maps',
            nodeRedBinary,
            '-u',
            nodeRedDir,
        ],
        {
            stdio: 'inherit', // Stream logs directly to the parent process
            env: { ...process.env, NODE_ENV: 'development' },
        },
    );

    nodeRedProcess.on('error', (err) => {
        console.error('Failed to start Node-RED:', err.message);
    });

    nodeRedProcess.on('close', (code) => {
        console.log(`Node-RED exited with code ${code}`);
        nodeRedProcess = null; // Clear the reference when the process exits
    });
};

// Ensure Node-RED is killed when the parent process exits
process.on('SIGINT', () => {
    if (nodeRedProcess) {
        console.log('Terminating Node-RED...');
        nodeRedProcess.kill('SIGINT');
    }
    process.exit();
});

// Function to restart Node-RED with a delay and a callback
const restartNodeRed = (onRestarted) => {
    const delay = 1000; // Delay in milliseconds (adjust as needed)

    if (nodeRedProcess) {
        console.log('Restarting Node-RED...');
        nodeRedProcess.on('close', () => {
            setTimeout(() => {
                startNodeRed();
                if (onRestarted) {
                    onRestarted(); // Trigger callback after Node-RED restarts
                }
            }, delay);
        });
        nodeRedProcess.kill('SIGTERM'); // Gracefully terminate the process
    } else {
        startNodeRed();
        if (onRestarted) {
            onRestarted();
        }
    }
};

const startDevServer = () => {
    const bs = browserSync.create();
    bs.init({
        ui: false, // Disable the BrowserSync UI
        proxy: {
            target: 'http://localhost:1880', // Proxy requests to the Node-RED server
            ws: true, // Enable WebSocket proxying
        },
        ghostMode: false, // Disable mirroring interactions across devices
        open: false, // Prevent BrowserSync from automatically opening a browser
    });

    startNodeRed();

    let debounceTimer = null;
    const changedFiles = new Set();

    const handleFileChange = async () => {
        const files = Array.from(changedFiles);
        changedFiles.clear();

        console.log(`Processing changes for: ${files.join(', ')}`);

        let browserReloadRequired = true;

        try {
            for (const filePath of files) {
                console.log(`Building due to change in: ${filePath}`);

                if (filePath.endsWith('.ts')) {
                    if (/^src\/nodes\/[^/]+\/migrations\.ts$/.test(filePath)) {
                        invalidateCache(['html', 'markdown']);
                        await buildEditorFiles();
                        await buildSourceFiles();
                    } else if (
                        /^src\/nodes\/[^/]+\/editor\/.+$/.test(filePath) ||
                        /^src\/nodes\/[^/]+\/editor\..+$/.test(filePath) ||
                        /^src\/editor\/.+$/.test(filePath) ||
                        /^src\/editor\.ts$/.test(filePath)
                    ) {
                        await buildEditorFiles();
                    } else {
                        await buildSourceFiles();
                        browserReloadRequired = false; // No browser reload for server-side files
                    }
                } else if (filePath.endsWith('.scss')) {
                    invalidateCache(['scss']);
                    await buildEditorFiles();
                } else if (filePath.endsWith('.html')) {
                    if (filePath.includes('/editor/editors/')) {
                        invalidateCache(['editorsHtml']);
                    } else if (filePath.includes('/editor/sidebar/')) {
                        invalidateCache(['sidebar', 'sidebarToolbar']);
                    } else {
                        invalidateCache(['html']);
                    }
                    await buildEditorFiles();
                } else if (filePath.endsWith('.handlebars')) {
                    invalidateCache(['handlebars']);
                    await buildEditorFiles();
                } else if (filePath.startsWith(ICONS_DIR)) {
                    // Pass only the changed icon files
                    await copyIcons([filePath]);
                } else if (filePath.endsWith('locale.json')) {
                    await buildLocales();
                } else if (filePath.endsWith('.md')) {
                    invalidateCache(['markdown']);
                    await buildEditorFiles();
                }
            }

            restartNodeRed(() => {
                if (browserReloadRequired) {
                    setTimeout(() => {
                        bs.reload();
                    }, 500);
                }
            });
        } catch (err) {
            console.error('Error during build:', err);
        }
    };

    // Watch for changes
    const watchPaths = [DOCS_DIR, ICONS_DIR, RESOURCES_DIR, SRC_DIR];

    const watcher = chokidar.watch(watchPaths, {
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100,
        },
    });

    watcher.on('all', (event, filePath) => {
        console.log(`File ${event}: ${filePath}`);
        changedFiles.add(filePath);

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(handleFileChange, 750); // Debounce delay of 500ms
    });
};

// Tasks
const cleanAll = async () => {
    invalidateCache([
        'scss',
        'html',
        'editorsHtml',
        'markdown',
        'sidebar',
        'sidebarToolbar',
        'handlebars',
    ]);
    await clean(DIST_DIR);
};

const buildAll = async () => {
    await cleanAll(); // Ensure clean build
    console.time('Total Build Time'); // Start total build time logging
    console.time('Building all tasks');

    const tasks = [
        { name: 'Editor Files', task: buildEditorFiles },
        { name: 'Source Files', task: buildSourceFiles },
        { name: 'Icons', task: copyIcons },
        { name: 'Locales', task: copyLocales },
        { name: 'Merged Locales', task: buildLocales },
    ];

    await Promise.all(
        tasks.map(async ({ name, task }) => {
            console.time(`Building ${name}`);
            try {
                await task();
                console.timeEnd(`Building ${name}`);
            } catch (err) {
                console.error(`Error building ${name}:`, err);
            }
        }),
    );

    console.timeEnd('Building all tasks');
    console.timeEnd('Total Build Time'); // End total build time logging
};

const start = async () => {
    console.time('Total Start Time'); // Start total start time logging
    await buildAll();
    startDevServer();
    console.timeEnd('Total Start Time'); // End total start time logging
};

// CLI Commands
const command = process.argv[2];
if (command === 'build') {
    buildAll();
} else if (command === 'start') {
    start();
} else if (command === 'clean') {
    cleanAll();
} else {
    console.log('Usage: node build.js [build|start|clean]');
}
