import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { HassStateChangedEvent } from '../../types/home-assistant';
import { EventsCalendarNode } from '.';

const ExposeAsController = ExposeAsMixin(OutputController<EventsCalendarNode>);
export default class EventsCalendarController extends ExposeAsController {
    #isEventValid(evt: HassStateChangedEvent) {
        if (!evt) {
            return false;
        }
        return true;
    }

    #isItemValid(item: CalendarItem) {
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
            calendarItem[calendarItemDateRef].dateTime ??
                calendarItem[calendarItemDateRef].date
        );

        return itemDate >= currentStart && itemDate < currentEnd;
    }

    /**
     * Query the home assistant API for all calendar event instances in the next 15 minutes for the given calendar entity
     *
     * @returns undefined
     */
    async queueUpcomingCalendarEvents( ) {
        let items = null;
        try {
            items = await this.homeAssistant.http.get(
                `/calendars/${this.node.config.entityId}`,
                {
                    start: offsetStart.toISOString(),
                    end: offsetEnd.toISOString(),
                }
            );
        } catch (exc) {
            this.status.setFailed(
                `calendar items could not be retrieved from entity_id "${this.node.config.entityId}"`
            );

            return;
        }

        items = items.filter(
            this.#isInIntervalRange.bind(this, currentStart, currentEnd)
        );

        // Create a timer for each matching item and place it in a queue cache

        // Calculate the next time-bounds and create a new timer that will queue the next set of upcoming events
    }

    async fireCalendarEvent(item: CalendarItem) {
        // Pull the item and timer off the queue cache so that it is only fired once

        if (
            this.isEnabled === false ||
            !this.homeAssistant.isHomeAssistantRunning ||
            !this.#isItemValid(item)
        ) {
            return;
        }

        // send the message including the calendar item
    }
}
