import { defineUserConfig } from 'vuepress';
import { defaultTheme } from '@vuepress/theme-default';
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics';
import { registerComponentsPlugin } from '@vuepress/plugin-register-components';
import { copyCodePlugin } from 'vuepress-plugin-copy-code2';
import { searchPlugin } from '@vuepress/plugin-search';
import { getDirname, path } from '@vuepress/utils';

const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
    base: '/node-red-contrib-home-assistant-websocket/',
    title: 'node-red-contrib-home-assistant-websocket',
    description:
        'Node-RED integration with Home Assistant through the WebSocket and HTTP API',
    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
    plugins: [
        googleAnalyticsPlugin({ id: 'G-T0F3RKFVF3' }),
        copyCodePlugin(),
        registerComponentsPlugin({
            componentsDir: path.resolve(__dirname, './components'),
        }),
        searchPlugin(),
    ],
    markdown: {
        code: {
            lineNumbers: false,
        },
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
        navbar: [
            { text: 'Guides', link: '/guide/' },
            { text: 'Nodes', link: '/node/' },
            { text: 'FAQ', link: '/FAQ.md' },
            { text: 'Cookbook', link: '/cookbook/' },
            { text: 'Scrubber', link: '/scrubber/' },
            {
                text: 'Forums',
                link: 'https://github.com/zachowj/node-red-contrib-home-assistant-websocket/discussions',
            },
        ],
        sidebar: {
            '/cookbook/': [
                {
                    text: 'Cookbook',
                    collapsible: false,
                    children: [
                        'jsonata-1-call-service',
                        'jsonata-2-current-state',
                        'jsonata-3-events-state',
                        'jsonata-4-trigger-state',
                        'jsonata-5-sensor',
                        'jsonata-6-switch-node',
                        'jsonata-7-change-node',
                        'jsonata-8-functions',
                        'motion-triggered-light',
                        'saving-and-restoring-states',
                        'get-state_changed-events-based-on-area',
                        'sun-events',
                        'vacation-mode',
                        'expiration-date-monitor',
                        'using-date-and-time-entities-to-trigger-flows',
                        'check-if-an-entity-was-turned-on-in-the-last-24-hours',
                        'starting-flow-after-home-assistant-restart',
                        'holiday-lights-scheduler-and-demo-mode-for-wled',
                        'actionable-notifications-subflow-for-android',
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
                        '/guide/call-service',
                        '/guide/conditionals',
                        '/guide/mustache-templates',
                        '/guide/jsonata',
                        '/guide/jsonata-primer',
                        '/guide/diagnostics',
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
                        'API',
                        'call-service',
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
