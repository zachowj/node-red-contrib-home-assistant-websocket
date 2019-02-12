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
                const { event } = this.utils.merge({}, evt);

                if (!this.active) {
                    return null;
                }

                const result = await this.getComparatorResult(
                    config.comparator,
                    config.value,
                    this.utils.selectn(config.property, event.new_state),
                    config.valueType
                );

                if (!result) {
                    return null;
                }

                clearTimeout(this.timeoutId);
                this.active = false;
                this.status({
                    fill: 'green',
                    text: `true at: ${this.getPrettyDate()}`
                });

                if (
                    config.entityLocationType !== 'none' &&
                    config.entityLocation
                ) {
                    event.new_state.timeSinceChangedMs =
                        Date.now() -
                        new Date(event.new_state.last_changed).getTime();
                    const contextKey = RED.util.parseContextStore(
                        config.entityLocation
                    );
                    contextKey.key = contextKey.key || 'data';
                    const locationType = config.entityLocationType || 'msg';

                    if (locationType === 'flow' || locationType === 'global') {
                        this.node
                            .context()
                            [locationType].set(
                                contextKey.key,
                                event.new_state,
                                contextKey.store
                            );
                    } else if (locationType === 'msg') {
                        this.savedMessage[contextKey.key] = event.new_state;
                    }
                }

                this.send([this.savedMessage, null]);
            } catch (e) {
                this.error(e);
            }
        }

        async onInput({ parsedMessage, message }) {
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
                    const state = await config.server.homeAssistant.getStates(
                        config.entityId
                    );

                    if (
                        config.entityLocationType !== 'none' &&
                        config.entityLocation
                    ) {
                        state.timeSinceChangedMs =
                            Date.now() - new Date(state.last_changed).getTime();

                        const contextKey = RED.util.parseContextStore(
                            config.entityLocation
                        );
                        contextKey.key = contextKey.key || 'data';
                        const locationType = config.entityLocationType || 'msg';

                        if (
                            locationType === 'flow' ||
                            locationType === 'global'
                        ) {
                            this.node
                                .context()
                                [locationType].set(
                                    contextKey.key,
                                    state,
                                    contextKey.store
                                );
                        } else if (locationType === 'msg') {
                            message[contextKey.key] = state;
                        }
                    }

                    node.active = false;
                    node.send([null, message]);
                    node.status({
                        fill: 'red',
                        shape: 'dot',
                        text: `timed out at: ${node.getPrettyDate()}`
                    });
                }, node.timeout);
            }
            node.status({ fill: 'blue', text: statusText });

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
