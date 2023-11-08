import { NodeMessageInFlow } from 'node-red';

import { RED } from '../../globals';
import { GConstructor } from '../../types/mixins';
import { NodeSend } from '../../types/nodes';
import OutputController from './OutputController';

export default function sendSplitMixin<
    TBase extends GConstructor<OutputController>
>(Base: TBase) {
    return class SendSplitController extends Base {
        protected sendSplit(
            message: Partial<NodeMessageInFlow>,
            data: any[],
            send?: NodeSend
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
    };
}
