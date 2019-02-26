const BaseNode = require('../../lib/base-node');
const { shuffle } = require('lodash');
const { filter } = require('p-iteration');

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

            if (this.nodeConfig.server === null) {
                this.node.error('No valid server selected.');
                return null;
            }

            const states = await this.nodeConfig.server.homeAssistant.getStates();
            if (!states) {
                this.node.warn(
                    'local state cache missing sending empty payload'
                );
                return { payload: {} };
            }

            let entities = await filter(Object.values(states), async entity => {
                const rules = this.nodeConfig.rules;

                for (const rule of rules) {
                    const value = this.utils.reach(rule.property, entity);
                    const result = await this.getComparatorResult(
                        rule.logic,
                        rule.value,
                        value,
                        rule.valueType
                    );
                    if (value === undefined || !result) {
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

                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: `${statusText} at: ${this.getPrettyDate()}`
                    });

                    this.sendSplit(message, entities);
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
                    let shuffledEntities = shuffle(entities);
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
