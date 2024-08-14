import { i18n } from './i18n';

const options = {
    target: '_blank',
    ref: 'noopener noreferrer',
    class: 'social-bar-button',
};

const documentation = i18n('home-assistant.ui.text.documentation');
function buildDocumentationButton(node?: string) {
    return $('<a>', {
        href: `https://zachowj.github.io/node-red-contrib-home-assistant-websocket/${node ? `node/${node}.html` : ''}`,
        title: documentation,
        text: documentation,
        ...options,
    });
}

function buildDiscordButton() {
    return $('<a>', {
        href: 'https://discord.gg/ktpFC2SK',
        title: 'Discord',
        text: 'Discord',
        ...options,
    });
}

const discussions = i18n('home-assistant.ui.text.discussions');
function buildDiscussionsButton() {
    return $('<a>', {
        href: 'https://github.com/zachowj/node-red-contrib-home-assistant-websocket/discussions',
        title: `Github ${discussions}`,
        text: discussions,
        ...options,
    });
}

function buildTitle() {
    return $('<span>', {
        text: i18n('home-assistant.ui.text.looking_for_help'),
    });
}

export function insertSocialBar(node?: string) {
    const $socialBar = $('<div>', {
        id: 'ha-social-bar',
    });

    $socialBar
        .append(buildTitle())
        .append(buildDocumentationButton(node))
        .append($('<span>').text(' / '))
        .append(buildDiscussionsButton())
        .append($('<span>').text(' / '))
        .append(buildDiscordButton());

    $('#dialog-form').prepend($socialBar);
}
