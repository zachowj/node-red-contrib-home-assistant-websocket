function wikiNodeLink(type) {
    let name = '';

    switch (type) {
        case 'api-current-state':
            name = 'current-state';
            break;
        case 'poll-state':
            name = 'poll-state';
            break;
        case 'server-state-changed':
            name = 'events-state-changed';
            break;
    }
    return `https://github.com/zachowj/node-red-contrib-home-assistant-websocket/wiki/${name}`;
}

// eslint-disable-next-line no-unused-vars
function versionCheck(node) {
    node.version = node.version === undefined ? 0 : Number(node.version);
    const versionAlert = `<div id="versionUpdate" class="ui-state-error"><p><strong>Alert:</strong>This node will be updated to version ${
        node._def.defaults.version.value
    } from ${node.version} (<a href="${wikiNodeLink(
        node.type
    )}#version" target="_blank" rel="noreferrer">changes</a>)</p></div>`;

    if (node.version < node._def.defaults.version.value) {
        // eslint-disable-next-line no-undef
        $('#dialog-form').prepend(versionAlert);
    }
}

// eslint-disable-next-line no-unused-vars
function updateNodeVersion(node) {
    if (node.version < node._def.defaults.version.value) {
        // eslint-disable-next-line no-undef
        $('#node-input-version').val(node._def.defaults.version.value);
    }
}
