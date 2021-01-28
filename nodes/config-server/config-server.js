const ConfigServer = require('./ConfigServer');
const { createHandlers } = require('./handlers');

module.exports = function (RED) {
    createHandlers(RED);

    function ServerConfigNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new ConfigServer({ node: this, config, RED });
        this.controller.init();
    }

    RED.nodes.registerType('server', ServerConfigNode, {
        credentials: {
            host: { type: 'text' },
            access_token: { type: 'text' },
        },
    });
};
