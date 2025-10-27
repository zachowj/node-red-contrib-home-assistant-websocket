import { viteBundler } from '@vuepress/bundler-vite';
import { copyCodePlugin } from '@vuepress/plugin-copy-code';
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics';
import { prismjsPlugin } from '@vuepress/plugin-prismjs';
import { registerComponentsPlugin } from '@vuepress/plugin-register-components';
import { searchPlugin } from '@vuepress/plugin-search';
import { defaultTheme } from '@vuepress/theme-default';
import { defineUserConfig } from 'vuepress';
import { getDirname, path } from 'vuepress/utils';

const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
    bundler: viteBundler(),
    base: '/node-red-contrib-home-assistant-websocket/',
    title: 'node-red-contrib-home-assistant-websocket',
    description:
        'A suite of nodes that seamlessly integrates Home Assistant with Node-RED',
    head: [
        [
            'link',
            {
                rel: 'icon',
                href: '/node-red-contrib-home-assistant-websocket/favicon.ico',
                size: '32x32',
            },
        ],
        [
            'link',
            {
                rel: 'icon',
                href: '/node-red-contrib-home-assistant-websocket/icon.svg',
                type: 'image/svg+xml',
            },
        ],
    ],
    plugins: [
        googleAnalyticsPlugin({ id: 'G-T0F3RKFVF3' }),
        copyCodePlugin(),
        prismjsPlugin({
            lineNumbers: false,
        }),
        registerComponentsPlugin({
            componentsDir: path.resolve(__dirname, './components'),
        }),
        searchPlugin(),
    ],
    markdown: {
        importCode: {
            handleImportPath: (str) =>
                str.replace(
                    /^@examples/,
                    path.resolve(__dirname, '../../examples'),
                ),
        },
    },
    theme: defaultTheme({
        repo: 'zachowj/node-red-contrib-home-assistant-websocket',
        repoLabel: 'Github',
        docsDir: 'docs',
        docsBranch: 'main',
        // editLinks: true,
        editLinkText: 'Help us improve this page!',
        logo: '/logo-256.png',
        navbar: [
            { text: 'Guides', link: '/guide/' },
            { text: 'Nodes', link: '/node/' },
            { text: 'FAQ', link: '/FAQ.md' },
            { text: 'Cookbook', link: '/cookbook/' },
            { text: 'Scrubber', link: '/scrubber/' },
            {
                text: 'Discussions',
                link: 'https://github.com/zachowj/node-red-contrib-home-assistant-websocket/discussions',
            },
            {
                text: 'Discord',
                link: 'https://discord.gg/QNdsZgNBnU',
            },
        ],
        sidebar: {
            '/cookbook/': [
                {
                    text: 'Cookbook',
                    collapsible: false,
                    children: [
                        {
                            text: 'JSONata',
                            collapsible: false,
                            children: [
                                '/cookbook/jsonata/action',
                                '/cookbook/jsonata/change-node',
                                '/cookbook/jsonata/current-state',
                                '/cookbook/jsonata/events-state',
                                '/cookbook/jsonata/functions',
                                '/cookbook/jsonata/sensor',
                                '/cookbook/jsonata/switch-node',
                                '/cookbook/jsonata/trigger-state',
                            ],
                        },
                        '/cookbook/motion-triggered-light',
                        '/cookbook/saving-and-restoring-states',
                        '/cookbook/get-state_changed-events-based-on-area',
                        '/cookbook/sun-events',
                        '/cookbook/vacation-mode',
                        '/cookbook/expiration-date-monitor',
                        '/cookbook/using-date-and-time-entities-to-trigger-flows',
                        '/cookbook/check-if-an-entity-was-turned-on-in-the-last-24-hours',
                        '/cookbook/starting-flow-after-home-assistant-restart',
                        '/cookbook/holiday-lights-scheduler-and-demo-mode-for-wled',
                        '/cookbook/actionable-notifications-subflow-for-android',
                    ],
                },
            ],
            '/guide/': [
                {
                    text: 'Guides',
                    collapsible: false,
                    children: [
                        '/guide/',
                        '/guide/first-automation',
                        '/guide/action',
                        '/guide/conditionals',
                        '/guide/mustache-templates',
                        {
                            text: 'JSONata',
                            collapsible: false,
                            children: [
                                '/guide/jsonata/',
                                '/guide/jsonata/jsonata-primer',
                            ],
                        },
                        '/guide/output-properties',
                        '/guide/diagnostics',
                        '/guide/breaking-changes',
                    ],
                },
                {
                    text: 'Custom Integration',
                    collapsible: false,
                    children: [
                        '/guide/custom_integration/',
                        '/guide/custom_integration/exposed-nodes',
                    ],
                },
                {
                    text: 'Contribute to',
                    collapsible: false,
                    children: ['/guide/development', '/guide/documentation'],
                },
            ],
            '/node/': [
                {
                    text: 'Config Nodes',
                    collapsible: true,
                    children: [
                        'device-config',
                        'entity-config',
                        'config-server',
                    ],
                },

                {
                    text: 'General Nodes',
                    collapsible: true,
                    children: [
                        'action',
                        'API',
                        'current-state',
                        'device',
                        'events-all',
                        'events-calendar',
                        'events-state',
                        'fire-event',
                        'get-entities',
                        'get-history',
                        'poll-state',
                        'render-template',
                        'sentence',
                        'tag',
                        'time',
                        'trigger-state',
                        'wait-until',
                        'webhook',
                        'zone',
                    ],
                },
                {
                    text: 'Entity Nodes',
                    collapsible: true,
                    children: [
                        'binary-sensor',
                        'button',
                        'entity',
                        'number',
                        'select',
                        'sensor',
                        'switch',
                        'text',
                        { text: 'Time', link: 'time-entity' },
                        'update-config',
                    ],
                },
            ],
        },
    }),
});
