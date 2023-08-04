import cloneDeep from 'lodash.clonedeep';

import ExposeAsController from '../../common/controllers/EposeAsController';
import { TAGS_ALL } from '../../const';
import { HassEvent } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { TagNode } from '.';

interface HassTagScannedEvent extends HassEvent {
    event: {
        device_id: string;
        tag_id: string;
    };
}

export default class TagController extends ExposeAsController<TagNode> {
    #isValidTag(tag: string): boolean {
        return this.node.config.tags.some((t) => {
            return t === TAGS_ALL || t === tag;
        });
    }

    #isValidDevice(deviceId: string): boolean {
        const devices = this.node.config.devices;
        return (devices?.length === 0 || devices?.includes(deviceId)) ?? false;
    }

    #getTagName(tagId: string): string | undefined {
        return this.homeAssistant.getTags().find((tag) => tag.tag_id === tagId)
            ?.name;
    }

    public async onTagScanned(evt: HassTagScannedEvent): Promise<void> {
        if (!this.isEnabled) return;

        const { event } = cloneDeep(evt);
        const { device_id: deviceId, tag_id: tagId } = event;

        if (!this.#isValidTag(tagId) || !this.#isValidDevice(deviceId)) return;

        const tagName = this.#getTagName(tagId);
        const eventData = {
            tag_name: tagName,
            user_id: evt.context.user_id,
            ...event,
        };

        const msg: NodeMessage = {};
        this.setCustomOutputs(this.node.config.outputProperties, msg, {
            config: this.node.config,
            eventData,
            triggerId: tagId,
        });

        this.status.setSuccess(`${tagName || tagId} scanned`);
        this.node.send(msg);
    }
}
