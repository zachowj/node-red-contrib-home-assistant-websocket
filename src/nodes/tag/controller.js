const cloneDeep = require('lodash.clonedeep');

const EventsHaNode = require('../EventsHaNode');

const nodeOptions = {
    config: {
        entities: {},
        tags: {},
        devices: {},
        outputProperties: {},
    },
};

class Tag extends EventsHaNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });

        this.addEventClientListener(
            `ha_events:tag_scanned`,
            this.onTagScanned.bind(this)
        );
    }

    async onTagScanned(evt) {
        if (this.isEnabled === false) return;

        const { event } = cloneDeep(evt);
        const { device_id: deviceId, tag_id: tagId } = event;

        if (!this.isValidTag(tagId) || !this.isValidDevice(deviceId)) return;

        const tagName = this.getTagName(tagId);
        const eventData = {
            tag_name: tagName,
            user_id: evt.context.user_id,
            ...event,
        };

        const msg = {};
        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, msg, {
                config: this.nodeConfig,
                eventData,
                triggerId: tagId,
            });
        } catch (e) {
            this.status.setFailed('error');
            this.node.error(e.message);
            return;
        }

        this.status.setSuccess(`${tagName || tagId} scanned`);
        this.send(msg);
    }

    isValidTag(tag) {
        return (
            this.nodeConfig.tags.includes('__ALL_TAGS__') ||
            this.nodeConfig.tags.includes(tag)
        );
    }

    isValidDevice(deviceId) {
        const devices = this.nodeConfig.devices;
        return devices.length === 0 || devices.includes(deviceId);
    }

    getTagName(tagId) {
        return this.homeAssistant.getTags().find((tag) => tag.tag_id === tagId)
            .name;
    }
}

module.exports = Tag;
