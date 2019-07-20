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
        async onInput({ message }) {
            const config = this.nodeConfig;
            let noPayload = false;

            if (config.server === null) {
                this.node.error('No valid server selected.', message);
                return;
            }

            const states = await config.server.homeAssistant.getStates();
            if (!states) {
                this.node.warn(
                    'local state cache missing sending empty payload'
                );
                return { payload: {} };
            }

            let entities;
            try {
                entities = await filter(Object.values(states), async entity => {
                    const rules = config.rules;

                    for (const rule of rules) {
                        const value = this.utils.selectn(rule.property, entity);
                        const result = await this.getComparatorResult(
                            rule.logic,
                            rule.value,
                            value,
                            rule.valueType,
                            {
                                message,
                                entity
                            }
                        );
                        if (
                            (rule.logic !== 'jsonata' && value === undefined) ||
                            !result
                        ) {
                            return false;
                        }
                    }

                    entity.timeSinceChangedMs =
                        Date.now() - new Date(entity.last_changed).getTime();
                    return true;
                });
            } catch (e) {
                this.setStatusFailed('Error');
                this.node.error(e.message, {});
                return;
            }

            let statusText = `${entities.length} entities`;
            let payload = {};

            switch (config.output_type) {
                case 'count':
                    payload = entities.length;
                    break;
                case 'split':
                    if (entities.length === 0) {
                        noPayload = true;
                        break;
                    }

                    this.setStatusSuccess(statusText);
                    this.sendSplit(message, entities);
                    return;
                case 'random':
                    if (entities.length === 0) {
                        noPayload = true;
                        break;
                    }
                    let maxReturned = Number(config.output_results_count) || 1;

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
                    if (entities.length === 0 && !config.output_empty_results) {
                        noPayload = true;
                    }

                    payload = entities;
                    break;
            }

            if (noPayload) {
                this.setStatusFailed('No Results');
                return null;
            }

            this.setStatusSuccess(statusText);

            this.setContextValue(
                payload,
                config.output_location_type,
                config.output_location,
                message
            );

            this.node.send(message);
        }
    }

    RED.nodes.registerType('ha-get-entities', GetEntitiesNode);
};
