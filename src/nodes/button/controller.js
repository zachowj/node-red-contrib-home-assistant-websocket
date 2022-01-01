const selectn = require('selectn');

const BaseNode = require('../../controllers/BaseNode');

const nodeDefaults = {
    config: {
        entityConfig: {
            isNode: true,
        },
        outputProperties: {},
    },
};

class ButtonController extends BaseNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions: nodeDefaults });
        this.listeners = {};
        this.addEventListener('triggered', this.onTrigger.bind(this));
    }

    onTrigger(data) {
        this.status.setSuccess('pressed');
        const message = {};
        this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
            config: this.nodeConfig,
            entity: data.entity,
            entityState: data.entity.state,
            triggerId: data.entity.entity_id,
        });
        this.send(message);
    }

    onClose() {
        this.removeEventListeners();
    }

    addEventListener(event, handler) {
        if (selectn('nodeConfig.entityConfig.controller', this)) {
            this.listeners[event] = handler;
            this.nodeConfig.entityConfig.controller.addListener(event, handler);
        }
    }

    removeEventListeners() {
        if (selectn('nodeConfig.entityConfig.controller', this)) {
            Object.entries(this.listeners).forEach(([event, handler]) => {
                this.nodeConfig.entityConfig.controller.removeListener(
                    event,
                    handler
                );
            });
        }
    }
}

module.exports = ButtonController;
