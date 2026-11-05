import { NodeMessage } from 'node-red';

import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import ValueEntityIntegration from '../../common/integration/ValueEntityIntegration';
import { Provides } from '../../common/services/TypedInputService';
import { NumberNode } from '.';

const ExposeAsController = ExposeAsMixin(
    OutputController<NumberNode, Provides<'value' | 'previousValue'>>,
);
export default class NumberOutputController extends ExposeAsController {
    protected integration?: ValueEntityIntegration;

    public async onValueChange(value: number, previousValue?: number) {
        if (!this.isEnabled || isNaN(value)) return;

        const message: NodeMessage = {};

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                value,
                previousValue,
            },
        );
        this.status.setSuccess(value.toString());
        this.node.send(message);
    }
}
