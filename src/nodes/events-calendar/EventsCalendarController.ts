import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { EventsCalendarNode } from '.';

const ExposeAsController = ExposeAsMixin(OutputController<EventsCalendarNode>);
export default class EventsCalendarController extends ExposeAsController {}
