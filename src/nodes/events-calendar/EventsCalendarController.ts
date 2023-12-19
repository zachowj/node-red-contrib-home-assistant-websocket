import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { getTimeInMilliseconds } from '../../helpers/utils';
import { EventsCalendarNode } from '.';
import { CalendarItem, createCalendarItem, ICalendarItem } from './const';

const ExposeAsController = ExposeAsMixin(OutputController<EventsCalendarNode>);
export default class EventsCalendarController extends ExposeAsController {
    #nextUpcomingTimer: NodeJS.Timeout | undefined;
    #queuedCalendarItemTimers: { [index: string]: NodeJS.Timeout } = {};
    #windowTime: number = 15 * 60000; // 15 minutes in milliseconds

    #isItemValid(item?: ICalendarItem) {
        if (!item) {
            return false;
        }
        return true;
    }

    #isInIntervalRange(
        currentStart: Date,
        currentEnd: Date,
        calendarItem: CalendarItem
    ): boolean {
        const itemDate = calendarItem.date(this.node.config.eventType);
        return itemDate >= currentStart && itemDate < currentEnd;
    }

    /**
     * Retrieve all calendar items in the upcoming window and queue them to fire at their allocated time.
     *
     * @returns undefined
     */
    async queueUpcomingCalendarEvents(start?: Date) {
        if (typeof start === 'undefined') {
            // if start is not defined, this is the result of an initial or reset call.
            // so reset the upcoming timer and clear the queue cache.
            clearTimeout(this.#nextUpcomingTimer);
            this.#nextUpcomingTimer = undefined;

            Object.keys(this.#queuedCalendarItemTimers).forEach((key) => {
                clearTimeout(this.#queuedCalendarItemTimers[key]);
                delete this.#queuedCalendarItemTimers[key];
            });
        }

        const offsetStart = start || new Date();
        const offsetEnd = new Date(offsetStart.getTime() + this.#windowTime);

        try {
            const items: CalendarItem[] | undefined =
                await this.retrieveCalendarItems(offsetStart, offsetEnd);

            if (!Array.isArray(items)) {
                return;
            }

            // Create a timer for each matching item and place it in a queue cache
            items.forEach((item) => this.queueCalendarItem(item));

            if (items.length > 0) {
                this.status.setSuccess(`queued ${items.length} items to send`);
            }
        } catch (exc) {
            this.status.setFailed(
                `calendar items could not be retrieved from entity_id "${this.node.config.entityId}", ${exc}`
            );
        }

        // Queue a timer for the next 15 minute window starting at offsetEnd.
        this.#nextUpcomingTimer = setTimeout(
            this.queueUpcomingCalendarEvents.bind(this, offsetEnd),
            this.#windowTime - 20 // Start the timer 20 milliseconds before the window ends just to give it a head start
        );
    }

    private async retrieveCalendarItems(
        offsetStart: Date,
        offsetEnd: Date
    ): Promise<CalendarItem[] | undefined> {
        const rawItems: ICalendarItem[] = await this.homeAssistant.http.get(
            `/calendars/${this.node.config.entityId}`,
            {
                start: offsetStart.toISOString(),
                end: offsetEnd.toISOString(),
            }
        );
        if (!Array.isArray(rawItems)) {
            return;
        }

        const items = rawItems
            .map(createCalendarItem)
            .filter(this.#isInIntervalRange.bind(this, offsetStart, offsetEnd));
        // TODO: filter out items that don't match this.node.config.filter
        // TODO: allow more customisable conditions for filtering

        return items;
    }

    async queueCalendarItem(item: CalendarItem) {
        const timeToFireMs = await this.calcFireMs(
            item.date(this.node.config.eventType)
        );
        if (timeToFireMs < 0) {
            return;
        }

        // If the timer is already in the queue cache, then remove it
        if (this.#queuedCalendarItemTimers[item.queueIndex()]) {
            clearTimeout(this.#queuedCalendarItemTimers[item.queueIndex()]);
        }

        // Queue/requeue it and set a timer to fire it at the appropriate time
        this.#queuedCalendarItemTimers[item.queueIndex()] = setTimeout(
            this.fireCalendarItem.bind(this, item),
            timeToFireMs
        );
    }

    private async calcFireMs(eventTime: Date) {
        const offsetNum = await this.typedInputService.getValue(
            this.node.config.offset,
            this.node.config.offsetType
        );
        const offsetMs = getTimeInMilliseconds(
            offsetNum,
            this.node.config.offsetUnits
        );
        const fireMs = eventTime.getTime() - offsetMs;
        const nowMs = Date.now();
        const timeToFireMs = fireMs - nowMs;
        return timeToFireMs;
    }

    async fireCalendarItem(item: ICalendarItem) {
        // Pull the item and timer off the queue cache so that it is only fired once
        const index = `${item.uid}${item.recurrence_id || ''}`;
        delete this.#queuedCalendarItemTimers[index];

        if (
            this.isEnabled === false ||
            !this.homeAssistant.isHomeAssistantRunning ||
            !this.#isItemValid(item)
        ) {
            return;
        }

        // send the message including the calendar item
        // TODO: allow the message object to be configured
        this.node.send({ payload: item });
        this.status.setSuccess(`${item.summary} sent`);
    }
}
