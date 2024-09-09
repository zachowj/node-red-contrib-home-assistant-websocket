import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import ValueEntityIntegration from '../../common/integration/ValueEntityIntegration';
import { NodeMessage } from '../../types/nodes';
import { SelectNode } from '.';

const ExposeAsController = ExposeAsMixin(OutputController<SelectNode>);
export default class SelectOutputController extends ExposeAsController {
    protected integration?: ValueEntityIntegration;

    public async onValueChange(value: string, previousValue?: string) {
        if (!this.isEnabled) return;

        const message: NodeMessage = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                value,
                previousValue,
            },
        );

        this.status.setSuccess(value);
        this.node.send(message);
    }
}
