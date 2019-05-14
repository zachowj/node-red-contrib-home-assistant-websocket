// eslint-disable-next-line no-unused-vars
var nodeVersion = (function($) {
    function wikiLink(type) {
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
    function check(node) {
        node.version = node.version === undefined ? 0 : Number(node.version);
        const versionAlert = `<div id="versionUpdate" class="ui-state-error"><p><strong>Alert:</strong>This node will be updated to version ${
            node._def.defaults.version.value
        } from ${node.version} (<a href="${wikiLink(
            node.type
        )}#version" target="_blank" rel="noreferrer">changes</a>)</p></div>`;

        if (node.version < node._def.defaults.version.value) {
            // eslint-disable-next-line no-undef
            $('#dialog-form').prepend(versionAlert);
        }
    }

    // eslint-disable-next-line no-unused-vars
    function update(node) {
        if (node.version < node._def.defaults.version.value) {
            // eslint-disable-next-line no-undef
            $('#node-input-version').val(node._def.defaults.version.value);
        }
    }

    return {
        check,
        update
    };
    // eslint-disable-next-line no-undef
})(jQuery);
