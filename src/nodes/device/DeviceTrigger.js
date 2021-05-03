const EventsHaNode = require('../EventsHaNode');
const { ENTITY_DEVICE_TRIGGER } = require('../../const');

const nodeOptions = {
    config: {
        device: {},
        deviceType: {},
        event: {},
        capabilities: {},
        outputProperties: {},
        exposeToHomeAssistant: () => true,
    },
};

class DeviceTrigger extends EventsHaNode {
    constructor({ node, config, RED }) {
        super({ node, config, RED, nodeOptions });
    }

    getDiscoveryPayload(config) {
        const payload = super.getDiscoveryPayload(config);
        return {
            ...payload,
            sub_type: ENTITY_DEVICE_TRIGGER,
            device_trigger: this.getTriggerData(),
        };
    }

    getTriggerData() {
        if (!this.nodeConfig.event) {
            throw new Error(
                this.RED._('ha-device.error.invalid_device_config')
            );
        }

        const trigger = { ...this.nodeConfig.event };
        if (
            this.nodeConfig.capabilities &&
            this.nodeConfig.capabilities.length
        ) {
            this.nodeConfig.capabilities.forEach((cap) => {
                trigger[cap.name] = this.getCapabilitiesValue(cap);
            });
        }

        return trigger;
    }

    getCapabilitiesValue(cap) {
        switch (cap.type) {
            case 'positive_time_period_dict': {
                const unit = cap.unit || 'seconds';
                return { [unit]: cap.value };
            }
            case 'float':
                return Number(cap.value);
            case 'string':
            default:
                return cap.value;
        }
    }

    onHaEventMessage(event) {
        if (event.type === 'device_trigger') {
            this.onTrigger(event.data);
        } else {
            super.onHaEventMessage(event);
        }
    }

    onTrigger(data) {
        if (!this.isEnabled) return;

        const message = {};

        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
                config: this.nodeConfig,
                eventData: data,
                triggerId: this.nodeConfig.device,
            });
        } catch (e) {
            this.status.setFailed(this.RED._('config-server.status.error'));
            this.node.error(e);
            return;
        }

        this.status.setSuccess(this.RED._('config-server.status.triggered'));
        this.send(message);
    }
}

module.exports = DeviceTrigger;
