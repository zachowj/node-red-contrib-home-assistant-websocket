const selectn = require('selectn');

const BaseNode = require('../../controllers/BaseNode');
const {
    addEventListeners,
    removeEventListeners,
} = require('../../helpers/utils');

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

        if (selectn('nodeConfig.entityConfig.controller', this)) {
            addEventListeners(
                { triggered: this.onTrigger },
                this.nodeConfig.entityConfig.controller
            );
        }
    }

    onTrigger = (data) => {
        this.status.setSuccess('pressed');
        const message = {};
        this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
            config: this.nodeConfig,
            entity: data.entity,
            entityState: data.entity.state,
            triggerId: data.entity.entity_id,
        });
        this.send(message);
    };

    onClose() {
        this.removeEventListeners();
    }

    removeEventListeners() {
        if (selectn('nodeConfig.entityConfig.controller', this)) {
            removeEventListeners(
                { triggered: this.onTrigger },
                this.nodeConfig.entityConfig.controller
            );
        }
    }
}

module.exports = ButtonController;
