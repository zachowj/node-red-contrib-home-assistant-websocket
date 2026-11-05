import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import ValueEntityIntegration from '../../common/integration/ValueEntityIntegration';
import { Provides } from '../../common/services/TypedInputService';
import { NodeMessage } from '../../types/nodes';
import { SelectNode } from '.';

const ExposeAsController = ExposeAsMixin(
    OutputController<SelectNode, Provides<'value' | 'previousValue'>>,
);
export default class SelectOutputController extends ExposeAsController {
    protected integration?: ValueEntityIntegration;

    public async onValueChange(value: string, previousValue?: string) {
        if (!this.isEnabled) return;

        const message: NodeMessage = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                value,
                previousValue,
            },
        );

        this.status.setSuccess(value);
        this.node.send(message);
    }
}
