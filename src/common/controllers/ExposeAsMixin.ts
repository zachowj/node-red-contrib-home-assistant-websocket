import { HaEvent } from '../../homeAssistant';
import { EntityConfigNode } from '../../nodes/entity-config';
import { Constructor, MergeCtor } from '../../types/mixins';
import { NodeMessage } from '../../types/nodes';
import Events from '../events/Events';
import { TriggerPayload } from '../integration/BidirectionalEntityIntegration';

export default function ExposeAsMixin<TBase extends Constructor>(Base: TBase) {
    const Derived = class ExposeAsController extends (Base as any) {
        protected exposeAsConfigEvents?: Events;
        protected readonly exposeAsConfigNode?: EntityConfigNode;

        constructor(props: { exposeAsConfigNode?: EntityConfigNode }) {
            super(props);
            this.exposeAsConfigNode = props.exposeAsConfigNode;

            if (props.exposeAsConfigNode) {
                this.exposeAsConfigEvents = new Events({
                    node: this.node,
                    emitter: props.exposeAsConfigNode,
                });
                this.exposeAsConfigEvents.addListener(
                    HaEvent.AutomationTriggered,
                    this.#onTriggered.bind(this)
                );
            }
        }

        get isEnabled(): boolean {
            return this.exposeAsConfigNode?.state?.isEnabled() ?? true;
        }

        // Find the number of outputs by looking at the number of wires
        get #numberOfOutputs(): number {
            if ('wires' in this.node && Array.isArray(this.node.wires)) {
                return this.node.wires.length;
            }

            return 0;
        }

        #onTriggered(data: TriggerPayload) {
            if (!this.isEnabled) return;

            const outputCount = this.#numberOfOutputs;

            // If there are no outputs, there is nothing to do
            if (outputCount === 0) return;

            // Remove any paths that are greater than the number of outputs
            const paths = data.output_path
                .split(',')
                .map((path) => Number(path))
                .filter((path) => path <= outputCount);

            // If there are no paths, there is nothing to do
            if (paths.length === 0) return;

            let payload: NodeMessage | (NodeMessage | null)[];

            // If there is only one path and it is 0 or 1, return the payload as is
            if (paths.length === 1 && paths.includes(1)) {
                payload = data.message;
            } else if (paths.includes(0)) {
                // create an array the size of the number of outputs and fill it with the payload
                payload = new Array(outputCount).fill([data.message]);
            } else {
                // create an array and fill it with the message only if index exists in paths
                payload = new Array(outputCount)
                    .fill(0)
                    .map((_, index) =>
                        paths.includes(index + 1) ? data.message : null
                    );
            }

            this.status.setSuccess('home-assistant.status.triggered');
            this.node.send(payload);
        }

        public getExposeAsConfigEvents(): Events | undefined {
            return this.exposeAsConfigEvents;
        }

        public enableExposeAs(enable = true) {
            this.exposeAsConfigNode?.integration.updateStateAndAttributes(
                enable,
                {}
            );
            this.exposeAsConfigNode?.state.setEnabled(enable);
        }
    };

    return Derived as MergeCtor<typeof Derived, TBase>;
}
