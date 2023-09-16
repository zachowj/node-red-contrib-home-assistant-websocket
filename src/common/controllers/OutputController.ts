import { NodeMessageInFlow } from 'node-red';

import { RED } from '../../globals';
import { debugToClient } from '../../helpers/node';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import {
    BaseNode,
    NodeDone,
    NodeMessage,
    NodeSend,
    OutputProperty,
} from '../../types/nodes';
import { NodeEvent } from '../events/Events';
import JSONataService from '../services/JSONataService';
import NodeRedContextService from '../services/NodeRedContextService';
import TypedInputService from '../services/TypedInputService';
import Status from '../status/Status';

export interface OutputControllerConstructor<T extends BaseNode> {
    homeAssistant: HomeAssistant;
    jsonataService: JSONataService;
    nodeRedContextService: NodeRedContextService;
    node: T;
    status: Status;
    typedInputService: TypedInputService;
}

export default class OutputController<T extends BaseNode = BaseNode> {
    protected readonly contextService: NodeRedContextService;
    protected readonly homeAssistant: HomeAssistant;
    protected readonly jsonataService: JSONataService;
    protected readonly node: T;
    protected readonly status: Status;
    protected readonly typedInputService: TypedInputService;

    constructor({
        homeAssistant,
        jsonataService,
        nodeRedContextService,
        node,
        status,
        typedInputService,
    }: OutputControllerConstructor<T>) {
        this.homeAssistant = homeAssistant;
        this.contextService = nodeRedContextService;
        this.jsonataService = jsonataService;
        this.node = node;
        this.status = status;
        this.typedInputService = typedInputService;

        node.on(NodeEvent.Close, this.#preOnClose.bind(this));

        const name = this.node?.config?.name ?? 'undefined';
        node.debug(`instantiated node, name: ${name}`);
    }

    protected onClose?(removed: boolean): void;

    protected sendSplit(
        message: Partial<NodeMessageInFlow>,
        data: any[],
        send: NodeSend
    ) {
        if (!send) {
            send = this.node.send;
        }

        delete message._msgid;
        message.parts = {
            id: RED.util.generateId(),
            count: data.length,
            index: 0,
            // TODO: check if this works
            // type: 'array',
            // len: 1,
        };

        let pos = 0;
        for (let i = 0; i < data.length; i++) {
            message.payload = data.slice(pos, pos + 1)[0];
            if (message.parts) {
                message.parts.index = i;
            }
            pos += 1;
            send(RED.util.cloneMessage(message));
        }
    }

    protected debugToClient(message: any | any[]) {
        debugToClient(this.node, message);
    }

    protected async setCustomOutputs(
        properties: OutputProperty[] = [],
        message: NodeMessage,
        extras: Record<string, any>
    ) {
        for (const item of properties) {
            const value = await this.typedInputService.getValue(
                item.value,
                item.valueType,
                {
                    message,
                    ...extras,
                }
            );

            try {
                this.contextService.set(
                    value,
                    item.propertyType,
                    item.property,
                    message
                );
            } catch (e) {
                this.node.warn(
                    `Custom Ouput Error (${item.propertyType}:${item.property}): ${e}`
                );
            }
        }
    }

    #preOnClose(removed: boolean, done: NodeDone) {
        this.node.debug(
            `closing node. Reason: ${
                removed ? 'node deleted' : 'node re-deployed'
            }`
        );
        try {
            this.onClose?.(removed);
            done();
        } catch (e) {
            if (e instanceof Error) {
                done(e);
            } else {
                done(new Error(e as string));
            }
        }
    }
}
