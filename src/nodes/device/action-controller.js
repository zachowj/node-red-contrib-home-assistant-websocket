const EventsHaNode = require('../EventsHaNode');

const nodeOptions = {
    config: {
        device: {},
        deviceType: {},
        event: {},
        capabilities: {},
        outputProperties: {},
        exposeToHomeAssistant: () => false,
    },
};

class DeviceAction extends EventsHaNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });
    }

    async onInput({ message, send, done }) {
        const capabilities = this.nodeConfig.capabilities.reduce((acc, cap) => {
            acc[cap.name] = cap.value;
            return acc;
        }, {});
        const payload = {
            type: 'nodered/device_action',
            action: { ...this.nodeConfig.event, ...capabilities },
        };
        await this.homeAssistant.send({ ...payload });

        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
                config: this.nodeConfig,
                data: payload,
            });
        } catch (e) {
            this.status.setFailed('error');
            done(e);
            return;
        }

        this.status.setSuccess(
            `${this.nodeConfig.event.domain}.${this.nodeConfig.event.type}`
        );
        send(message);
        done();
    }
}

module.exports = DeviceAction;
