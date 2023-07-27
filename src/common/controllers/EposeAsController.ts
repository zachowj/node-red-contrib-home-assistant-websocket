import { EntityConfigNode } from '../../nodes/entity-config';
import { BaseNode } from '../../types/nodes';
import { TriggerPayload } from '../integration/BidirectionalEntityIntegration';
import OutputController, {
    OutputControllerConstructor,
} from './OutputController';

export interface ExposeAsControllerConstructor<T extends BaseNode>
    extends OutputControllerConstructor<T> {
    exposeAsConfigNode?: EntityConfigNode;
}

export default abstract class ExposeAsController<
    T extends BaseNode = BaseNode
> extends OutputController<T> {
    protected readonly exposeAsConfigNode?: EntityConfigNode;

    constructor(props: ExposeAsControllerConstructor<T>) {
        super(props);
        this.exposeAsConfigNode = props.exposeAsConfigNode;
    }

    get isEnabled(): boolean {
        return this.exposeAsConfigNode?.state?.isEnabled() ?? false;
    }

    public abstract onTriggered(data: TriggerPayload): void;
}
