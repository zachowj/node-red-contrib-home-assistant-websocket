import { NodeMessage } from 'node-red';

import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import ValueEntityIntegration from '../../common/integration/ValueEntityIntegration';
import { Provides } from '../../common/services/TypedInputService';
import { TimeEntityNode } from '.';

const ExposeAsController = ExposeAsMixin(
    OutputController<TimeEntityNode, Provides<'value' | 'previousValue'>>,
);
export default class TimeEntityController extends ExposeAsController {
    protected integration?: ValueEntityIntegration;
    // Triggers when a entity value changes in Home Assistant
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

        // inject value so colons are not removed
        this.status.setSuccess(['__value__', { value }]);
        this.node.send(message);
    }
}
