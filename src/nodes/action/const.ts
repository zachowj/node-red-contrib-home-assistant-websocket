import { HassServiceTarget } from 'home-assistant-js-websocket';

import { NodeDone, NodeMessage, NodeSend } from '../../types/nodes';

export enum Queue {
    None = 'none',
    First = 'first',
    All = 'all',
    Last = 'last',
}

export interface QueueItem {
    domain: string;
    service: string;
    data: Record<string, unknown> | undefined;
    target: HassServiceTarget;
    message: NodeMessage;
    done: NodeDone;
    send: NodeSend;
}
