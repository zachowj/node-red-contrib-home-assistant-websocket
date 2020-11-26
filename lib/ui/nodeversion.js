// eslint-disable-next-line no-unused-vars, no-var
var nodeVersion = (function ($) {
    function wikiLink(type) {
        let name = '';

        switch (type) {
            case 'api-current-state':
                name = 'current-state';
                break;
            case 'api-call-service':
                name = 'call-service';
                break;
            case 'poll-state':
                name = 'poll-state';
                break;
            case 'server-state-changed':
                name = 'events-state';
                break;
        }
        return `https://zachowj.github.io/node-red-contrib-home-assistant-websocket/node/${name}.html#changelog`;
    }

    function check(node) {
        node.version = node.version === undefined ? 0 : Number(node.version);
        const versionAlert = `<div id="version-update" class="ui-state-error ha-alert-box"><p><strong>Alert:</strong>This node will be updated to version ${
            node._def.defaults.version.value
        } from ${node.version} (<a href="${wikiLink(
            node.type
        )}#version" target="_blank" rel="noreferrer">changes</a>)</p></div>`;

        if (node.version < node._def.defaults.version.value) {
            $('#dialog-form').prepend(versionAlert);
        }
    }

    function update(node) {
        if (node.version < node._def.defaults.version.value) {
            $('#node-input-version').val(node._def.defaults.version.value);
        }
    }

    function ifStateLabels(index) {
        if (this.halt_if || this.haltifstate) {
            if (Number(this.version) === 0 || this.version === undefined) {
                if (index === 0) return "'If State' is false";
                if (index === 1) return "'If State' is true";
            }

            if (index === 0) return "'If State' is true";
            if (index === 1) return "'If State' is false";
        }
    }

    function labelStyle() {
        return `${
            this._def.defaults.version &&
            Number(this.version) !== this._def.defaults.version.value
                ? 'ha-node-label-legacy '
                : ''
        }${this.name ? 'node_label_italic' : ''}`;
    }

    return {
        check,
        ifStateLabels,
        labelStyle,
        update,
    };
    // eslint-disable-next-line no-undef
})(jQuery);
