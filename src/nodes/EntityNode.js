const merge = require('lodash.merge');

const EventsHaNode = require('./EventsHaNode');
const { INTEGRATION_UNLOADED } = require('../const');

const DEFAULT_NODE_OPTIONS = {
    config: {
        outputs: 1,
        entityType: {},
        config: {},
        exposeToHomeAssistant: () => true,
    },
};

class EntityNode extends EventsHaNode {
    constructor({ node, config, RED, status, nodeOptions = {} }) {
        nodeOptions = merge({}, DEFAULT_NODE_OPTIONS, nodeOptions);
        super({ node, config, RED, status, nodeOptions });
    }

    onHaIntegration(type) {
        super.onHaIntegration(type);

        if (type === INTEGRATION_UNLOADED) {
            this.node.error(
                'Node-RED custom integration has been removed from Home Assistant it is needed for this node to function.'
            );
            this.status.setFailed('Error');
        }
    }
}

module.exports = EntityNode;
