module.exports = function(RED) {
    const EventsNode = require('../../lib/events-node');

    const nodeOptions = {
        config: {
            name: {},
            server: { isNode: true },
            outputs: 1,
            entityId: {},
            property: {},
            comparator: {},
            value: {},
            valueType: {},
            timeout: {},
            timeoutUnits: {},
            entityLocation: {},
            entityLocationType: {},
            checkCurrentState: {}
        }
    };

    class WaitUntilNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.active = false;
            this.savedMessage = {};
            this.timeoutId = -1;

            this.addEventClientListener({
                event: `ha_events:state_changed:${this.nodeConfig.entityId}`,
                handler: this.onEntityChange.bind(this)
            });
        }

        async onEntityChange(evt) {
            try {
                const config = this.nodeConfig;
                const event = Object.assign({}, evt.event);

                if (!this.active) {
                    return null;
                }

                const result = await this.getComparatorResult(
                    config.comparator,
                    config.value,
                    this.utils.selectn(config.property, event.new_state),
                    config.valueType,
                    {
                        message: this.savedMessage,
                        entity: event.new_state
                    }
                );

                if (!result) {
                    return null;
                }

                clearTimeout(this.timeoutId);
                this.active = false;
                this.setStatusSuccess('true');

                if (
                    config.entityLocationType !== 'none' &&
                    config.entityLocation
                ) {
                    event.new_state.timeSinceChangedMs =
                        Date.now() -
                        new Date(event.new_state.last_changed).getTime();

                    this.setContextValue(
                        event.new_state,
                        config.entityLocationType,
                        config.entityLocation,
                        this.savedMessage
                    );
                }

                this.send([this.savedMessage, null]);
            } catch (e) {
                this.error(e, this.savedMessage);
            }
        }

        async onInput({ message }) {
            const node = this;
            const config = node.nodeConfig;

            clearTimeout(node.timeoutId);
            if (message.hasOwnProperty('reset')) {
                node.status({ text: 'reset' });
                node.active = false;
                return null;
            }

            node.savedMessage = message;
            node.active = true;
            let statusText = 'waiting';

            if (config.timeout > 0) {
                if (config.timeoutUnits === 'milliseconds') {
                    node.timeout = config.timeout;
                    statusText = `waiting for ${config.timeout} milliseconds`;
                } else if (config.timeoutUnits === 'minutes') {
                    node.timeout = config.timeout * (60 * 1000);
                    statusText = `waiting for ${config.timeout} minutes`;
                } else if (config.timeoutUnits === 'hours') {
                    node.timeout = config.timeout * (60 * 60 * 1000);
                    statusText = node.timeoutStatus(node.timeout);
                } else if (config.timeoutUnits === 'days') {
                    node.timeout = config.timeout * (24 * 60 * 60 * 1000);
                    statusText = node.timeoutStatus(node.timeout);
                } else {
                    node.timeout = config.timeout * 1000;
                    statusText = `waiting for ${config.timeout} seconds`;
                }

                node.timeoutId = setTimeout(async function() {
                    const state = Object.assign(
                        {},
                        await config.server.homeAssistant.getStates(
                            config.entityId
                        )
                    );

                    state.timeSinceChangedMs =
                        Date.now() - new Date(state.last_changed).getTime();

                    node.setContextValue(
                        state,
                        config.entityLocationType,
                        config.entityLocation,
                        message
                    );

                    node.active = false;
                    node.send([null, message]);
                    node.setStatusFailed('timed out');
                }, node.timeout);
            }
            node.setStatus({ text: statusText });

            if (config.checkCurrentState === true) {
                const currentState = await this.nodeConfig.server.homeAssistant.getStates(
                    config.entityId
                );

                node.onEntityChange({ event: { new_state: currentState } });
            }
        }

        timeoutStatus(milliseconds = 0) {
            const timeout = Date.now() + milliseconds;
            const timeoutStr = new Date(timeout).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour12: false,
                hour: 'numeric',
                minute: 'numeric'
            });

            return `waiting until ${timeoutStr}`;
        }
    }

    RED.nodes.registerType('ha-wait-until', WaitUntilNode);
};
