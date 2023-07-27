import cloneDeep from 'lodash.clonedeep';

import ExposeAsController, {
    ExposeAsControllerConstructor,
} from '../../common/controllers/EposeAsController';
import { TriggerPayload } from '../../common/integration/BidirectionalEntityIntegration';
import { TAGS_ALL } from '../../const';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { HassEvent } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { TagNode } from '.';

interface TagControllerConstructor
    extends ExposeAsControllerConstructor<TagNode> {
    homeAssistant: HomeAssistant;
}

interface HassTagScannedEvent extends HassEvent {
    event: {
        device_id: string;
        tag_id: string;
    };
}

export default class TagController extends ExposeAsController<TagNode> {
    #homeAssistant: HomeAssistant;

    constructor(props: TagControllerConstructor) {
        super(props);
        this.#homeAssistant = props.homeAssistant;
    }

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
        return this.#homeAssistant.getTags().find((tag) => tag.tag_id === tagId)
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

    public onTriggered(data: TriggerPayload): void {
        if (!this.isEnabled) return;

        this.status.setSuccess('home-assistant.status.triggered');
        this.node.send({ payload: data.payload });
    }
}
