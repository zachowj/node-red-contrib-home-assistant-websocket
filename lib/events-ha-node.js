const merge = require('lodash.merge');
const EventsNode = require('./events-node');

const DEFAULT_NODE_OPTIONS = {
    debug: false,
    config: {
        name: {},
        server: {
            isNode: true
        },
        haConfig: {},
        exposeToHomeAssistant: nodeDef =>
            nodeDef.exposeToHomeAssistant === undefined
                ? false
                : nodeDef.exposeToHomeAssistant
    }
};

class EventsHaNode extends EventsNode {
    constructor(nodeDefinition, RED, nodeOptions = {}) {
        nodeOptions = merge({}, DEFAULT_NODE_OPTIONS, nodeOptions);
        super(nodeDefinition, RED, nodeOptions);
        this.isEnabled = true;
        this.integrationErrorMessage =
            'Node-RED custom integration needs to installed in Home Assistant to use the expose feature.';

        // Determine if node needs to be removed from Home Assistant because it's no longer exposed
        this.removeFromHA = !!(
            this.nodeConfig.exposeToHomeAssistant === false &&
            this.nodeConfig.server.exposedNodes[this.id] === true
        );
        // Save expose state so we can check if it needs to removed when it's not exposed anymore
        this.nodeConfig.server.exposedNodes[
            this.id
        ] = this.nodeConfig.exposeToHomeAssistant;

        this.loadPersistedData();

        if (this.isConnected) {
            this.registerEntity();
            this.removeFromHomeAssistant();
        }
    }

    async onClose(removed) {
        super.onClose(removed);

        if (removed) {
            if (this.isConnected && this.nodeConfig.exposeToHomeAssistant) {
                this.removeFromHomeAssistant(true);
            }
            await this.removeNodeData();
        }

        this.removeSubscription();
    }

    async onHaConfigUpdate() {
        this.registerEntity();
        this.removeFromHomeAssistant();
    }

    onHaIntegration(type) {
        if (type === 'loaded') {
            this.registerEntity();
        } else if (type === 'unloaded') {
            this.isEnabled = true;
            this.registered = false;
            if (this.subscription) {
                this.subscription();
                this.subscription = null;
            }
            this.updateConnectionStatus();
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

    async registerEntity() {
        if (this.subscription || super.registerEntity() === false) {
            return;
        }

        const haConfig = {};
        this.nodeConfig.haConfig
            .filter(c => {
                return c.value.length;
            })
            .forEach(e => {
                haConfig[e.property] = e.value;
            });

        const payload = {
            type: 'nodered/discovery',
            server_id: this.nodeConfig.server.id,
            node_id: this.id,
            component: 'switch',
            state: this.isEnabled,
            config: haConfig
        };

        this.subscription = await this.websocketClient.client.subscribeMessage(
            this.onEvent.bind(this),
            payload
        );

        this.setStatusSuccess('Registered');
        this.registered = true;
    }

    async onEvent(evt) {
        this.isEnabled = evt.state;
        this.saveNodeData('isEnabled', this.isEnabled);
        this.updateHomeAssistant();
        this.updateConnectionStatus();
    }

    async updateHomeAssistant() {
        const message = {
            type: 'nodered/entity',
            server_id: this.nodeConfig.server.id,
            node_id: this.id,
            state: this.isEnabled
        };

        this.websocketClient.send(message);
    }

    // Remove from Home Assistant when `Expose to Home Assistant` is unchecked
    removeFromHomeAssistant(nodeRemoved = false) {
        if (
            this.websocketClient.integrationVersion === 0 ||
            (!this.removeFromHA && !nodeRemoved)
        ) {
            return;
        }

        const payload = {
            type: 'nodered/discovery',
            server_id: this.nodeConfig.server.id,
            node_id: this.id,
            component: 'switch',
            remove: true
        };

        this.websocketClient.send(payload);
        this.removeFromHA = false;
        this.removeSubscription();

        // Enabled node when removing it from Home Assistant as there is no
        // way to do so once it's removed except for the trigger-state node
        this.isEnabled = true;
        this.saveNodeData('isEnabled', this.isEnabled);
    }

    removeSubscription() {
        if (this.subscription) {
            this.subscription();
            this.subscription = null;
        }
    }
}

module.exports = EventsHaNode;
