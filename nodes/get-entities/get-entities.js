const BaseNode = require('../../lib/base-node');
const lodash = require('lodash');

module.exports = function(RED) {
    const nodeOptions = {
        debug: true,
        config: {
            server: { isNode: true },
            name: {},
            rules: {},
            output_type: {},
            output_empty_results: {},
            output_location_type: {},
            output_location: {},
            output_results_count: {}
        }
    };

    class GetEntitiesNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        /* eslint-disable camelcase */
        async onInput({ parsedMessage, message }) {
            let noPayload = false;

            const states = await this.nodeConfig.server.homeAssistant.getStates();
            if (!states) {
                this.node.warn(
                    'local state cache missing sending empty payload'
                );
                return { payload: {} };
            }

            let entities = Object.values(states).filter(entity => {
                const rules = this.nodeConfig.rules;

                for (const rule of rules) {
                    const value = this.utils.reach(rule.property, entity);
                    if (
                        value === undefined ||
                        !this.getComparatorResult(
                            rule.logic,
                            rule.value,
                            value,
                            rule.valueType
                        )
                    ) {
                        return false;
                    }
                }

                entity.timeSinceChangedMs =
                    Date.now() - new Date(entity.last_changed).getTime();

                return true;
            });

            let statusText = `${entities.length} entities`;
            let payload = {};

            switch (this.nodeConfig.output_type) {
                case 'split':
                    if (entities.length === 0) {
                        noPayload = true;
                        break;
                    }
                    message.parts = {};
                    message.parts.id = RED.util.generateId();
                    delete message._msgid;
                    message.parts.type = 'array';
                    message.parts.count = entities.length;

                    let pos = 0;
                    message.parts.len = 1;
                    for (let i = 0; i < entities.length; i++) {
                        message.payload = entities.slice(pos, pos + 1)[0];
                        message.parts.index = i;
                        pos += 1;
                        this.node.send(this.RED.util.cloneMessage(message));
                    }

                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: `${statusText} at: ${this.getPrettyDate()}`
                    });

                    return;
                case 'random':
                    if (entities.length === 0) {
                        noPayload = true;
                        break;
                    }
                    let maxReturned =
                        Number(this.nodeConfig.output_results_count) || 1;

                    const max =
                        entities.length <= maxReturned
                            ? entities.length
                            : maxReturned;
                    let shuffledEntities = lodash.shuffle(entities);
                    payload = shuffledEntities.slice(0, max);
                    if (maxReturned === 1) {
                        payload = payload[0];
                    }
                    statusText = `${
                        maxReturned === 1 ? 1 : payload.length
                    } Random`;
                    break;
                case 'array':
                default:
                    if (
                        entities.length === 0 &&
                        !this.nodeConfig.output_empty_results
                    ) {
                        noPayload = true;
                    }

                    payload = entities;
                    break;
            }

            if (noPayload) {
                this.status({
                    fill: 'red',
                    shape: 'ring',
                    text: `No Results at: ${this.getPrettyDate()}`
                });

                return null;
            }

            this.status({
                fill: 'green',
                shape: 'dot',
                text: `${statusText} at: ${this.getPrettyDate()}`
            });

            const contextKey = RED.util.parseContextStore(
                this.nodeConfig.output_location
            );
            const locationType = this.nodeConfig.output_location_type;
            if (locationType === 'flow' || locationType === 'global') {
                this.node
                    .context()
                    [locationType].set(
                        contextKey.key,
                        payload,
                        contextKey.store
                    );
            } else {
                message[contextKey.key] = payload;
            }

            this.node.send(message);
        }
    }

    RED.nodes.registerType('ha-get-entities', GetEntitiesNode);
};
