import { defineUserConfig } from 'vuepress';
import type { DefaultThemeOptions } from 'vuepress';
import path from 'path';
import { trimEnd } from 'lodash';

export default defineUserConfig<DefaultThemeOptions>({
    base: '/node-red-contrib-home-assistant-websocket/',
    title: 'node-red-contrib-home-assistant-websocket',
    description:
        'Node-RED integration with Home Assistant through the WebSocket and HTTP API',
    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
    plugins: [
        ['@vuepress/plugin-google-analytics', { id: 'G-T0F3RKFVF3' }],
        ['vuepress-plugin-copy-code2', {}],
        [
            '@vuepress/register-components',
            {
                componentsDir: path.resolve(__dirname, './components'),
            },
        ],
        ['@vuepress/plugin-search'],
    ],
    markdown: {
        code: {
            lineNumbers: false,
        },
        importCode: {
            handleImportPath: (str) =>
                str.replace(
                    /^@examples/,
                    path.resolve(__dirname, '../../examples')
                ),
        },
    },
    theme: '@vuepress/theme-default',
    themeConfig: {
        repo: 'zachowj/node-red-contrib-home-assistant-websocket',
        repoLabel: 'Github',
        docsDir: 'docs',
        docsBranch: 'main',
        editLinks: true,
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
                        'jsonata',
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
                        '',
                        'first-automation',
                        'call-service',
                        'conditionals',
                        'mustache-templates',
                        'jsonata',
                    ],
                },
                {
                    text: 'Custom Integration',
                    collapsible: false,
                    children: [
                        'custom_integration/',
                        'custom_integration/event-nodes',
                        'custom_integration/switch',
                    ],
                },
                {
                    text: 'Contribute to',
                    collapsible: false,
                    children: ['development', 'documentation'],
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
                        'events-state',
                        'fire-event',
                        'get-entities',
                        'get-history',
                        'poll-state',
                        'render-template',
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
                        'sensor',
                        'switch',
                    ],
                },
            ],
        },
    },
});
