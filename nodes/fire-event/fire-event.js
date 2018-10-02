const BaseNode = require('../../lib/base-node');

module.exports = function (RED) {
    const nodeOptions = {
        debug: true,
        config: {
            event: {},
            data: {},
            mergecontext: {},
            name: {},
            server: {
                isNode: true
            }
        }
    };

    class FireEventNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        // Disable connection status for api node
        setConnectionStatus() {}
        tryToObject(v) {
            if (!v) return null;
            try {
                return JSON.parse(v);
            } catch (e) {
                return v;
            }
        }

        onInput({
            message
        }) {
            let payload, payloadEvent;

            if (message && message.payload) {
                payload = this.tryToObject(message.payload);
                payloadEvent = this.utils.reach('event', payload);
            }
            const configEvent = this.nodeConfig.event;

            const eventType = payloadEvent || configEvent;
            const eventData    = this.getEventData(payload);
            if (!eventType) throw new Error('fire event node is missing "event" property, not found in config or payload');

            this.debug(`Fire Event: ${eventType} -- ${JSON.stringify({})}`);
            this.status({
                fill: 'green',
                shape: 'dot',
                text: `${eventType} at: ${this.getPrettyDate()}`
            });

            message.payload = {
                event: eventType,
                data: eventData || null
            };
            this.send(message);

            return this.nodeConfig.server.api.fireEvent(eventType, eventData)
                .catch(err => {
                    this.error(`Error firing event, home assistant rest api error: ${err.message}`, message);
                    this.status({ fill: 'red', shape: 'ring', text: `API Error at: ${this.prettyDate}` });
                });
        }

        getEventData(payload) {
            let eventData;
            let contextData = {};

            let payloadData = this.utils.reach('data', payload);
            let configData  = this.tryToObject(this.nodeConfig.data);
            payloadData = payloadData || {};
            configData  = configData || {};

            // Cacluate payload to send end priority ends up being 'Config, Global Ctx, Flow Ctx, Payload' with right most winning
            if (this.nodeConfig.mergecontext) {
                const ctx     = this.node.context();
                let flowVal   = ctx.flow.get(this.nodeConfig.mergecontext);
                let globalVal = ctx.global.get(this.nodeConfig.mergecontext);
                flowVal       = flowVal || {};
                globalVal     = globalVal || {};
                contextData   = this.utils.merge({}, globalVal, flowVal);
            }

            eventData = this.utils.merge({}, configData, contextData, payloadData);
            return eventData;
        }
    }

    RED.nodes.registerType('ha-fire-event', FireEventNode);
};