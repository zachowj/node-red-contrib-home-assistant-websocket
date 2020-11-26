// eslint-disable-next-line no-unused-vars, no-var
var haServer = (function ($, RED) {
    let $server;
    let serverId;
    let node;

    function setDefault() {
        let defaultServer;
        RED.nodes.eachConfig((n) => {
            if (n.type === 'server' && !defaultServer) defaultServer = n.id;
        });
        if (defaultServer) $server.val(defaultServer);
    }

    function init(n, server) {
        $server = $(server);
        node = n;

        if (!node.server) {
            setDefault();
        }
    }

    function autocomplete(type, callback) {
        // If a server is selected populate drop downs
        const selectedServer = $server.val();
        if (node.server || (selectedServer && selectedServer !== '_ADD_')) {
            serverId = node.server || selectedServer;
            getItems(type, callback);
        }

        $server.change(() => {
            serverId = $server.val();
            getItems(type, callback);
        });
    }

    function getItems(type, callback) {
        // If no server added yet just return
        if (serverId === '_ADD_') return;

        $.getJSON(`homeassistant/${serverId}/${type}`)
            .done((items) => {
                callback(items);
            })
            .fail((err) => {
                const serverConfig = RED.nodes.node($server.val());

                if (serverConfig && serverConfig.dirty === true) {
                    RED.notify(
                        `You probably haven't deployed since adding a server. Do that for autocomplete to work.\n${err.responseText}`,
                        'error'
                    );
                }
            });
    }

    return {
        init,
        autocomplete,
    };

    // eslint-disable-next-line no-undef
})(jQuery, RED);
