import Events from '../../common/events/Events';
import State from '../../common/State';
import EventsStatus, {
    EventsStatusConstructor,
} from '../../common/status/EventStatus';
import { HaEvent } from '../../homeAssistant';

interface TriggerStatusConstructor extends EventsStatusConstructor {
    events: Events;
    state: State;
}

// trigger-state node can be enabled/disabled without being exposed to HA
// a custom status is needed to handle this
export default class TriggerStateStatus extends EventsStatus {
    #state: State;

    constructor(props: TriggerStatusConstructor) {
        super(props);

        this.#state = props.state;

        props.events.addListener(
            HaEvent.StateChanged,
            this.onStateChange.bind(this)
        );
    }

    protected get isExposeAsEnabled(): boolean {
        if (this.exposeAsEntityConfigNode) {
            return this.exposeAsEntityConfigNode.state.isEnabled();
        }

        return this.#state.isEnabled();
    }
}
