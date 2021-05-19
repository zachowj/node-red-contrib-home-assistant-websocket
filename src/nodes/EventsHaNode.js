const Joi = require('joi');
const merge = require('lodash.merge');

const EventsNode = require('./EventsNode');
const Storage = require('../helpers/Storage');
const { INTEGRATION_UNLOADED, INTEGRATION_NOT_LOADED } = require('../const');
const { STATUS_SHAPE_DOT, STATUS_SHAPE_RING } = require('../helpers/status');

const DEFAULT_NODE_OPTIONS = {
    debug: false,
    config: {
        haConfig: {},
        exposeToHomeAssistant: (nodeDef) =>
            nodeDef.exposeToHomeAssistant === undefined
                ? false
                : nodeDef.exposeToHomeAssistant,
    },
};

class EventsHaNode extends EventsNode {
    constructor({ node, config, RED, status, nodeOptions = {} }) {
        nodeOptions = merge({}, DEFAULT_NODE_OPTIONS, nodeOptions);
        super({ node, config, RED, status, nodeOptions });
        this.storage = new Storage({
            id: this.node.id,
            path: RED.settings.userDir,
        });

        // Check if there's a server selected
        if (this.nodeConfig.server) {
            // Determine if node needs to be removed from Home Assistant because it's no longer exposed
            this.removeFromHA = !!(
                this.nodeConfig.exposeToHomeAssistant === false &&
                this.server.exposedNodes[this.id] === true
            );
            // Save expose state so we can check if it needs to removed when it's not exposed anymore
            this.server.exposedNodes[
                this.node.id
            ] = this.nodeConfig.exposeToHomeAssistant;
        }
        this.init();
    }

    async init() {
        await this.loadPersistedData();

        if (this.isIntegrationLoaded) {
            this.registerEntity();
            this.removeFromHomeAssistant();
        }
    }

    async onClose(removed) {
        super.onClose(removed);

        if (removed) {
            if (
                this.isIntegrationLoaded &&
                this.nodeConfig.exposeToHomeAssistant
            ) {
                this.removeFromHomeAssistant(true);
            }
            await this.storage.removeData();
        }

        this.removeSubscription();
    }

    onHaEventsOpen() {
        this.subscription = null;
    }

    onHaIntegration(type) {
        super.onHaIntegration(type);

        switch (type) {
            case INTEGRATION_UNLOADED:
            case INTEGRATION_NOT_LOADED:
                this.removeSubscription();
                break;
        }
    }

    async loadPersistedData() {
        const data = await this.storage.getData().catch((e) => {
            this.node.error(e.message);
        });

        if (!data) return;

        if (Object.prototype.hasOwnProperty.call(data, 'isEnabled')) {
            this.isEnabled = data.isEnabled;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'lastPayload')) {
            this.lastPayload = data.lastPayload;
        }
    }

    getDiscoveryPayload(config) {
        return {
            type: 'nodered/discovery',
            server_id: this.nodeConfig.server.id,
            node_id: this.node.id,
            component: 'switch',
            state: this.isEnabled,
            config,
        };
    }

    async registerEntity(status = true) {
        if (super.registerEntity() === false) {
            return;
        }

        const haConfig = {};
        // Handle both event node and sensor node switch HA config
        const config = this.nodeConfig.haConfig || this.nodeConfig.config;
        config
            .filter((c) => c.value.length)
            .forEach((e) => (haConfig[e.property] = e.value));

        try {
            const payload = this.getDiscoveryPayload(haConfig);
            this.node.debug(`Registering with Home Assistant`);
            this.subscription = await this.homeAssistant.subscribeMessage(
                this.onHaEventMessage.bind(this),
                payload,
                { resubscribe: false }
            );
        } catch (e) {
            this.status.setFailed(this.RED._('config-server.status.error'));
            this.node.error(e.message);
            return;
        }

        if (status) {
            this.status.setSuccess(
                this.RED._('config-server.status.registered')
            );
        }
        this.registered = true;
    }

    onHaEventMessage(evt) {
        if (evt.type === undefined) {
            // Need to set type prior to 0.20.0
            evt.type = 'state_changed';
        }
        if (evt.type) {
            switch (evt.type) {
                case 'state_changed':
                    this.isEnabled = evt.state;
                    this.storage.saveData('isEnabled', this.isEnabled);
                    this.updateHomeAssistant();
                    break;
                case 'automation_triggered':
                    this.handleTriggerMessage(evt.data);
                    break;
            }
        }
    }

    async handleTriggerMessage(data = {}) {
        if (this.isEnabled === false) {
            return;
        }

        const schema = Joi.object({
            entity_id: Joi.string().allow(null),
            skip_condition: Joi.boolean().default(false),
            output_path: Joi.boolean().default(true),
        });
        let validatedData, entity, entityId;

        try {
            validatedData = await schema.validateAsync(data);

            entityId = validatedData.entity_id || this.getNodeEntityId();

            if (!entityId) {
                throw new Error(
                    'Entity filter type is not set to exact and no entity_id found in trigger data.'
                );
            }

            entity = this.homeAssistant.getStates(entityId);

            if (!entity) {
                throw new Error(
                    `entity_id provided by trigger event not found in cache: ${entityId}`
                );
            }
        } catch (e) {
            this.status.setFailed('Error');
            this.node.error(`Trigger Error: ${e.message}`, {});
            return;
        }

        const eventMessage = {
            event_type: 'triggered',
            entity_id: entity.entity_id,
            event: {
                entity_id: entity.entity_id,
                old_state: entity,
                new_state: entity,
            },
        };

        if (!validatedData.skip_condition) {
            this.triggerNode(eventMessage);
            return;
        }

        const conditionalValue = validatedData.output_path;

        const msg = {
            topic: entityId,
            payload: eventMessage.event.new_state.state,
            data: eventMessage.event,
        };

        this.status.set({
            shape: conditionalValue ? STATUS_SHAPE_DOT : STATUS_SHAPE_RING,
            text: this.status.appendDateString(
                eventMessage.event.new_state.state
            ),
        });
        this.send(conditionalValue ? [msg, null] : [null, msg]);
    }

    getNodeEntityId() {}

    triggerNode() {}

    updateHomeAssistant() {
        if (!this.isIntegrationLoaded) return;

        const message = {
            type: 'nodered/entity',
            server_id: this.nodeConfig.server.id,
            node_id: this.node.id,
            state: this.isEnabled,
        };

        this.homeAssistant.send(message);
    }

    // Remove from Home Assistant when `Expose to Home Assistant` is unchecked
    removeFromHomeAssistant(nodeRemoved = false) {
        if (
            !this.homeAssistant.isIntegrationLoaded ||
            (!this.removeFromHA && !nodeRemoved) ||
            (this.nodeConfig.entityType &&
                this.nodeConfig.entityType !== 'switch')
        ) {
            return;
        }

        const payload = {
            type: 'nodered/discovery',
            server_id: this.nodeConfig.server.id,
            node_id: this.node.id,
            component: 'switch',
            remove: true,
        };

        this.homeAssistant.send(payload);
        this.removeFromHA = false;
        this.removeSubscription();

        // Enabled node when removing it from Home Assistant as there is no
        // way to do so once it's removed except for the trigger-state node
        this.isEnabled = true;
        this.storage.saveData('isEnabled', this.isEnabled);
    }

    async removeSubscription() {
        if (this.subscription) {
            this.node.debug('Unregistering from HA');
            await this.subscription().catch(() => {});
        }
        this.subscription = null;
    }
}

module.exports = EventsHaNode;
