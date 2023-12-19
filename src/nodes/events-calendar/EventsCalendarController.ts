import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { getTimeInMilliseconds } from '../../helpers/utils';
import { HassStateChangedEvent } from '../../types/home-assistant';
import { EventsCalendarNode } from '.';
import { CalendarItem, toDate } from './const';

const ExposeAsController = ExposeAsMixin(OutputController<EventsCalendarNode>);
export default class EventsCalendarController extends ExposeAsController {
    #nextUpcomingTimer: NodeJS.Timeout | undefined;
    #queuedCalendarItemTimers: { [index: string]: NodeJS.Timeout } = {};

    #isEventValid(evt: HassStateChangedEvent) {
        if (!evt) {
            return false;
        }
        return true;
    }

    #isItemValid(item: CalendarItem | undefined) {
        if (!item) {
            return false;
        }
        return true;
    }

    #isInIntervalRange(
        currentStart: Date,
        currentEnd: Date,
        calendarItem: CalendarItem
    ) {
        const calendarItemDateRef = this.node.config.eventType; // 'start' or 'end'
        const itemDate = new Date(
            calendarItemDateRef === 'start'
                ? toDate(calendarItem.start)
                : toDate(calendarItem.end)
        );

        return itemDate >= currentStart && itemDate < currentEnd;
    }

    /**
     * Query the home assistant API for all calendar event instances in the next 15 minutes for the given calendar entity
     *
     * @returns undefined
     */
    async queueUpcomingCalendarEvents(start: Date | undefined = undefined) {
        const windowTime = 15 * 60000; // 15 minutes in milliseconds
        // const windowTime = 7 * 24 * 60 * 60000; // 1 week in milliseconds

        const offsetStart = start || new Date();
        const offsetEnd = new Date(offsetStart.getTime() + windowTime);

        let items: CalendarItem[] | null = null;
        try {
            items = await this.homeAssistant.http.get<CalendarItem[]>(
                `/calendars/${this.node.config.entityId}`,
                {
                    start: offsetStart.toISOString(),
                    end: offsetEnd.toISOString(),
                }
            );
        } catch (exc) {
            this.status.setFailed(
                `calendar items could not be retrieved from entity_id "${this.node.config.entityId}", ${exc}`
            );

            return;
        }

        items = items.filter(
            this.#isInIntervalRange.bind(this, offsetStart, offsetEnd)
        );

        if (Array.isArray(items)) {
            items.forEach((item) => this.queueCalendarItem(item));
        }

        // Create a timer for each matching item and place it in a queue cache

        // Queue a timer for the next 15 minute window starting at offsetEnd.
        this.#nextUpcomingTimer = setTimeout(
            this.queueUpcomingCalendarEvents.bind(this, offsetEnd),
            windowTime - 20 // Start the timer 20 milliseconds before the window ends just to give it a head start
        );
    }

    async queueCalendarItem(item: CalendarItem) {
        // concat uid and recurrence id to be the queue cache index
        const index = `${item.uid}${item.recurrence_id || ''}`;

        // set a timer from now to the start or end (depending on this.node.config.eventType) of the event item. consider this.node.config.offset, this.node.config.offsetType(num or jsonata), and this.node.config.offsetUnits (hours, minutes or seconds)
        const offsetNum = await this.typedInputService.getValue(
            this.node.config.offset,
            this.node.config.offsetType
        );
        const offsetMs = getTimeInMilliseconds(
            offsetNum,
            this.node.config.offsetUnits
        );
        const eventItemMs =
            this.node.config.eventType === 'start'
                ? toDate(item.start).getTime()
                : toDate(item.end).getTime();
        const fireMs = eventItemMs - offsetMs;
        const nowMs = Date.now();
        const timeToFireMs = fireMs - nowMs;
        if (timeToFireMs < 0) {
            return;
        }

        // If the timer is already in the queue cache, then remove it
        if (this.#queuedCalendarItemTimers[index]) {
            clearTimeout(this.#queuedCalendarItemTimers[index]);
        }

        // Queue/requeue it and set a timer to fire it at the appropriate time
        this.#queuedCalendarItemTimers[index] = setTimeout(
            this.fireCalendarItem.bind(this, item),
            timeToFireMs
        );
    }

    async fireCalendarItem(item: CalendarItem) {
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
        this.node.send({ payload: item });
    }
}
