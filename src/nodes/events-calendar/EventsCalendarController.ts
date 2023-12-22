import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { RED } from '../../globals';
import { getTimeInMilliseconds } from '../../helpers/utils';
import { EventsCalendarNode } from '.';
import { CalendarItem, createCalendarItem, ICalendarItem } from './const';

const ExposeAsController = ExposeAsMixin(OutputController<EventsCalendarNode>);
export default class EventsCalendarController extends ExposeAsController {
    #nextUpcomingTimer: NodeJS.Timeout | undefined;
    #queuedCalendarItemTimers: { [index: string]: NodeJS.Timeout } = {};
    #intervalLengthMs: number = 15 * 60000; // 15 minutes in milliseconds
    #headStartMs: number = 20; // give the next queue 20 milliseconds head start

    #isItemValid(item?: ICalendarItem) {
        if (!item) {
            return false;
        }
        return true;
    }

    #calendarItemMatches(
        currentStart: Date,
        currentEnd: Date,
        filter: string | undefined,
        calendarItem: CalendarItem
    ): boolean {
        const itemDate = calendarItem.date(this.node.config.eventType);
        if (!(itemDate >= currentStart && itemDate < currentEnd)) {
            return false;
        }

        if (filter && !calendarItem.summary.includes(filter)) {
            return false;
        }

        return true;
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

        const now = new Date();

        const nodeOffsetMs = await this.getOffsetMs();
        const offsetIntervalStart =
            start || new Date(now.getTime() + nodeOffsetMs);
        const offsetIntervalEnd = new Date(
            offsetIntervalStart.getTime() + this.#intervalLengthMs
        );

        const nextQueueTime = new Date(
            offsetIntervalEnd.getTime() - this.#headStartMs // Start the timer 20 milliseconds before the window ends just to give it a head start
        );

        try {
            const items: CalendarItem[] | undefined =
                await this.retrieveCalendarItems(
                    offsetIntervalStart,
                    offsetIntervalEnd
                );

            if (!Array.isArray(items)) {
                return;
            }

            // Create a timer for each matching item and place it in a queue cache
            items.forEach((item) => this.queueCalendarItem(item, now));

            if (items.length > 1) {
                this.status.setSending(
                    RED._('ha-events-calendar.status.queued-multi', {
                        count: items.length,
                    })
                );
            } else if (items.length > 0) {
                this.status.setSending(
                    RED._('ha-events-calendar.status.queued-one')
                );
            } else {
                this.status.setSending(
                    RED._('ha-events-calendar.status.queued-none')
                );
            }
        } catch (exc: any) {
            this.status.setFailed(
                RED._('ha-events-calendar.error.retrieval', {
                    entity: this.node.config.entityId,
                    error: exc.message,
                })
            );
        }

        // Queue a timer for the next interval starting at intervalEnd.
        this.#nextUpcomingTimer = setTimeout(
            this.queueUpcomingCalendarEvents.bind(this, offsetIntervalEnd),
            nextQueueTime.getTime() - now.getTime()
        );
    }

    private async retrieveCalendarItems(
        intervalStart: Date,
        intervalEnd: Date
    ): Promise<CalendarItem[] | undefined> {
        const rawItems: ICalendarItem[] = await this.homeAssistant.http.get(
            `/calendars/${this.node.config.entityId}`,
            {
                start: intervalStart.toISOString(),
                end: intervalEnd.toISOString(),
            }
        );
        if (!Array.isArray(rawItems)) {
            return;
        }
        const filterText = this.node.config.filter
            ? await this.typedInputService.getValue(
                  this.node.config.filter,
                  this.node.config.filterType
              )
            : undefined;

        const items = rawItems
            .map(createCalendarItem)
            .filter(
                this.#calendarItemMatches.bind(
                    this,
                    intervalStart,
                    intervalEnd,
                    filterText
                )
            );
        // TODO: allow more customisable conditions for filtering

        return items;
    }

    private async queueCalendarItem(item: CalendarItem, now: Date) {
        let timeToFireMs = await this.calcFireMs(
            item.date(this.node.config.eventType),
            now
        );
        if (timeToFireMs < 0 - this.#headStartMs) {
            // if time has significantly passed for this item, then don't bother queuing it.
            return;
        } else if (timeToFireMs < 0) {
            // if time has passed only a little bit but we have an item to queue, perhaps we should just fire it now.
            timeToFireMs = 0;
        }

        // If the timer is already in the queue cache, then remove it ready for replacement
        if (this.#queuedCalendarItemTimers[item.queueIndex()]) {
            clearTimeout(this.#queuedCalendarItemTimers[item.queueIndex()]);
        }

        // Queue/requeue it and set a timer to fire it at the appropriate time
        this.#queuedCalendarItemTimers[item.queueIndex()] = setTimeout(
            this.fireCalendarItem.bind(this, item),
            timeToFireMs
        );
    }

    private async calcFireMs(eventTime: Date, now: Date) {
        const nodeOffsetMs = await this.getOffsetMs();
        const fireMs = eventTime.getTime() - nodeOffsetMs;
        const timeToFireMs = fireMs - now.getTime();
        return timeToFireMs;
    }

    private async getOffsetMs() {
        const offsetNum = await this.typedInputService.getValue(
            this.node.config.offset,
            this.node.config.offsetType
        );
        const nodeOffsetMs = getTimeInMilliseconds(
            offsetNum,
            this.node.config.offsetUnits
        );
        return nodeOffsetMs;
    }

    private async fireCalendarItem(item: CalendarItem) {
        // Pull the item and timer off the queue cache so that it is only fired once
        const index = item.queueIndex();
        delete this.#queuedCalendarItemTimers[index];

        if (
            this.isEnabled === false ||
            !this.homeAssistant.isHomeAssistantRunning ||
            !this.#isItemValid(item)
        ) {
            return;
        }

        // send the message including the calendar item
        const message = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                calendarItem: item as ICalendarItem,
            }
        );
        this.node.send(message);
        this.status.setSuccess(
            RED._('ha-events-calendar.status.sent', { summary: item.summary })
        );
    }
}
