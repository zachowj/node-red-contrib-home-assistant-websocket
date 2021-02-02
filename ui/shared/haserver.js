// eslint-disable-next-line no-unused-vars
const haServer = (function ($, RED) {
    let $server;
    let serverId;
    let node;
    let limitNotification = false;

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
        let selectedServerId = $server.val();
        if (node.server || (selectedServerId && selectedServerId !== '_ADD_')) {
            serverId = node.server || selectedServerId;
            getItems(type, callback);
        }

        $server.on('change', () => {
            serverId = $server.val();
            if (serverId !== selectedServerId) {
                selectedServerId = serverId;
                getItems(type, callback);
            }
        });
    }

    function getItems(type, callback) {
        // If no server added yet just return
        if (serverId === '_ADD_') return;

        $.getJSON(`homeassistant/${type}/${serverId}`)
            .done((items) => {
                callback(items);
            })
            .fail((jqxhr) => {
                if (jqxhr.status === 503 && limitNotification === false) {
                    limitNotification = true;
                    RED.notify(node._('config-server.errors.server_deploy'));
                    setTimeout(() => (limitNotification = false), 2000);
                }
            });
    }

    return {
        init,
        autocomplete,
    };

    // eslint-disable-next-line no-undef
})(jQuery, RED);
