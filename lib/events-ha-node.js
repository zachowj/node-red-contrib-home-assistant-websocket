const Joi = require('joi');
const merge = require('lodash.merge');

const EventsNode = require('./events-node');
const { INTEGRATION_UNLOADED, INTEGRATION_NOT_LOADED } = require('./const');

const DEFAULT_NODE_OPTIONS = {
    debug: false,
    config: {
        name: {},
        server: { isNode: true },
        haConfig: {},
        exposeToHomeAssistant: (nodeDef) =>
            nodeDef.exposeToHomeAssistant === undefined
                ? false
                : nodeDef.exposeToHomeAssistant,
    },
};

class EventsHaNode extends EventsNode {
    constructor(nodeDefinition, RED, nodeOptions = {}) {
        nodeOptions = merge({}, DEFAULT_NODE_OPTIONS, nodeOptions);
        super(nodeDefinition, RED, nodeOptions);
        this.isEnabled = true;

        // Check if there's a server selected
        if (this.nodeConfig.server) {
            // Determine if node needs to be removed from Home Assistant because it's no longer exposed
            this.removeFromHA = !!(
                this.nodeConfig.exposeToHomeAssistant === false &&
                this.nodeConfig.server.exposedNodes[this.id] === true
            );
            // Save expose state so we can check if it needs to removed when it's not exposed anymore
            this.nodeConfig.server.exposedNodes[
                this.id
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
            await this.removeNodeData();
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
                if (this.type !== 'trigger-state') {
                    this.isEnabled = true;
                }
                this.removeSubscription();
                this.updateConnectionStatus();
                break;
        }
    }

    async loadPersistedData() {
        try {
            const data = await this.getNodeData();
            if (
                data &&
                Object.prototype.hasOwnProperty.call(data, 'isEnabled')
            ) {
                this.isEnabled = data.isEnabled;
                this.updateConnectionStatus();
            }
        } catch (e) {
            this.error(e.message);
        }
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

        const payload = {
            type: 'nodered/discovery',
            server_id: this.nodeConfig.server.id,
            node_id: this.id,
            component: 'switch',
            state: this.isEnabled,
            config: haConfig,
        };

        this.debug(`Registering with HA`);
        this.subscription = await this.websocketClient.client.subscribeMessage(
            this.onHaEventMessage.bind(this),
            payload,
            { resubscribe: false }
        );

        if (status) {
            this.setStatusSuccess('Registered');
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
                    this.saveNodeData('isEnabled', this.isEnabled);
                    this.updateHomeAssistant();
                    this.updateConnectionStatus();
                    break;
                case 'automation_triggered':
                    this.handleTriggerMessage(evt.data);
                    break;
            }
        }
    }

    async handleTriggerMessage(data = {}) {
        if (this.isEnabled === false || this.type === 'ha-zone') {
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

            entity = this.nodeConfig.server.homeAssistant.getStates(entityId);

            if (!entity) {
                throw new Error(
                    `entity_id provided by trigger event not found in cache: ${entityId}`
                );
            }
        } catch (e) {
            this.setStatusFailed('Error');
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

        this.setStatus({
            fill: 'blue',
            shape: conditionalValue ? 'dot' : 'ring',
            text: `${
                eventMessage.event.new_state.state
            } at: ${this.getPrettyDate()}`,
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
            node_id: this.id,
            state: this.isEnabled,
        };

        this.websocketClient.send(message);
    }

    // Remove from Home Assistant when `Expose to Home Assistant` is unchecked
    removeFromHomeAssistant(nodeRemoved = false) {
        if (
            this.websocketClient.integrationVersion === 0 ||
            (!this.removeFromHA && !nodeRemoved) ||
            (this.nodeConfig.entityType &&
                this.nodeConfig.entityType !== 'switch')
        ) {
            return;
        }

        const payload = {
            type: 'nodered/discovery',
            server_id: this.nodeConfig.server.id,
            node_id: this.id,
            component: 'switch',
            remove: true,
        };

        this.websocketClient.send(payload);
        this.removeFromHA = false;
        this.removeSubscription();

        // Enabled node when removing it from Home Assistant as there is no
        // way to do so once it's removed except for the trigger-state node
        this.isEnabled = true;
        this.saveNodeData('isEnabled', this.isEnabled);
    }

    async removeSubscription() {
        if (this.subscription) {
            this.debug('Unregistering from HA');
            await this.subscription().catch(() => {});
        }
        this.subscription = null;
    }
}

module.exports = EventsHaNode;
