import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import {
    setIntervalWithErrorHandling,
    setTimeoutWithErrorHandling,
} from '../../common/errors/inputErrorHandler';
import { RED } from '../../globals';
import { getTimeInMilliseconds } from '../../helpers/utils';
import { EventsCalendarNode } from '.';
import CalendarItem, {
    createCalendarItem,
    ICalendarItem,
} from './CalendarItem';
import EventQueue from './EventQueue';
import {
    alignDateToMidnight,
    isTriggerTimeInPast,
    shortenString,
} from './helpers';
import { retryWithBackoff } from './retryWithBackoff';
import SentEventCache from './SentEventCache';

interface Timespan {
    start: Date;
    end: Date;
}

export interface QueuedCalendarEvent {
    triggerTime: Date; // The exact Date when this event should be triggered
    event: CalendarItem; // The original CalendarEvent
}

const ExposeAsController = ExposeAsMixin(OutputController<EventsCalendarNode>);
export default class EventsCalendarController extends ExposeAsController {
    static readonly OVERLAP_MS = 60_000; // 1 minutes
    static readonly POLL_INTERVAL_MS = 900_000; // Default 15 minutes

    #scheduledTimer: NodeJS.Timeout | null = null;
    #sentCache = new SentEventCache();
    #timer: NodeJS.Timeout | null = null;
    #eventQueue: EventQueue = new EventQueue(this.#sentCache);

    /**
     * Starts the polling process if it is not already running.
     *
     * This method initiates an immediate poll and then schedules
     * subsequent polls at a configured interval. The polling process
     * is managed by a timer, which ensures that the `#poll` method
     * is executed repeatedly at the specified interval.
     */
    public async startPolling() {
        if (this.#timer) return;

        // Initial poll immediately
        await this.#poll();

        // Repeat at configured interval
        this.#timer = setIntervalWithErrorHandling(
            () => this.#poll(),
            EventsCalendarController.POLL_INTERVAL_MS,
            { status: this.status },
        );
    }

    /**
     * Stops polling and clears all scheduled events and timers when the node is closed.
     */
    protected onClose() {
        if (this.#timer) {
            clearInterval(this.#timer);
            this.#timer = null;
        }
        if (this.#scheduledTimer) {
            clearTimeout(this.#scheduledTimer);
            this.#scheduledTimer = null;
        }
        this.#eventQueue.clear();
        this.#sentCache.clear();
    }

    /**
     * Retrieves the offset in milliseconds based on the node's configuration.
     *
     * This method calculates the offset by fetching the value from the node's
     * configuration using the `typedInputService` and converting it into
     * milliseconds based on the specified offset units.
     *
     * @returns {Promise<number>} A promise that resolves to the offset in milliseconds.
     */
    async #getOffsetMs(): Promise<number> {
        const offsetNum = await this.typedInputService.getValue(
            this.node.config.offset,
            this.node.config.offsetType,
        );
        const nodeOffsetMs = getTimeInMilliseconds(
            offsetNum,
            this.node.config.offsetUnits,
        );
        return nodeOffsetMs;
    }

    /**
     * Calculates and retrieves the next time window (`Timespan`) based on the current time,
     * overlap, and polling interval. If no current time span exists, it creates an initial
     * time span. Otherwise, it calculates the next upcoming time span.
     *
     * @returns {Promise<Timespan>} A promise that resolves to the next time window (`Timespan`).
     */
    async #getNextWindow(): Promise<Timespan> {
        const currentMs = Date.now();
        const offsetMs = Math.abs(await this.#getOffsetMs());

        const timespan = {
            start: new Date(
                currentMs - EventsCalendarController.OVERLAP_MS - offsetMs,
            ),
            end: new Date(
                currentMs +
                    EventsCalendarController.POLL_INTERVAL_MS +
                    EventsCalendarController.OVERLAP_MS +
                    offsetMs,
            ),
        };

        return timespan;
    }

    /**
     * Fetches events from the API and converts them into QueuedCalendarEvents with trigger times.
     * Applies the configured offset relative to the event's start or end.
     * @param timespan - Time window to fetch events for
     */
    async #fetchEvents(timespan: Timespan): Promise<ICalendarItem[]> {
        let calendarItems: ICalendarItem[] = [];

        try {
            calendarItems = await retryWithBackoff(
                () =>
                    this.homeAssistant.http.get(
                        `/calendars/${this.node.config.entityId}`,
                        {
                            start: timespan.start.toISOString(),
                            end: timespan.end.toISOString(),
                        },
                    ),
                {
                    retries: 5,
                    baseMs: 1_000,
                    maxMs: 30_000,
                    beforeRetry: (attempt, wait) => {
                        this.status.setFailed([
                            'ha-events-calendar.status.fetch_failed',
                            {
                                attempt: attempt + 1,
                                max_attempts: 5,
                                delay: Math.round(wait / 1000),
                            },
                        ]);
                    },
                    onGiveUp: (err) => {
                        this.status.setError([
                            'ha-events-calendar.status.fetch_max_failed',
                            {
                                error_message: err?.message ?? err,
                            },
                        ]);
                    },
                },
            );
        } catch {
            // Give up for this poll cycle
            return [];
        }
        if (!Array.isArray(calendarItems)) return [];

        return calendarItems;
    }

    /**
     * Evaluate a single calendar event and determines if it should be added to the queue.
     * @param event - The raw calendar event to process.
     * @param eventType - The type of event (start or end).
     * @param offsetMs - The offset in milliseconds to apply.
     * @param filterText - Optional filter text to match against the event summary.
     * @param now - The current time in milliseconds.
     * @returns A QueuedCalendarEvent if the event is valid, or undefined otherwise.
     */
    async #evaluateEvent(
        event: ICalendarItem,
    ): Promise<QueuedCalendarEvent | undefined> {
        const item = createCalendarItem(event);
        let baseTime = item.date(this.node.config.eventType);

        // Skip if already sent
        if (this.#sentCache.has(item.uniqueId)) return;

        // Align all-day events to midnight before applying offset
        if (item.isAllDayEvent) {
            baseTime = alignDateToMidnight(baseTime);
        }

        const offsetMs = (await this.#getOffsetMs()) ?? 0;

        // Calculate the trigger time with the offset
        const triggerTime = new Date(baseTime.getTime() + offsetMs);

        // Skip if the event's trigger time has already passed
        if (isTriggerTimeInPast(triggerTime, Date.now())) return;

        const filterText = this.node.config.filter
            ? await this.typedInputService.getValue(
                  this.node.config.filter,
                  this.node.config.filterType,
              )
            : undefined;

        // Skip if the event does not match the filter
        if (filterText && !item.summary.includes(filterText)) return;

        return {
            triggerTime,
            event: item,
        };
    }

    /**
     * Schedules the next event in the event queue. If a timer is already scheduled, it clears the existing timer
     * before scheduling a new one. The method calculates the delay based on the trigger time of the next event
     * in the queue and the current time. If the event queue is empty, the method exits without scheduling anything.
     *
     * Once the timer triggers, it processes the events in the queue and recursively schedules the next event.
     */
    #scheduleNextEvent() {
        if (this.#scheduledTimer) {
            clearTimeout(this.#scheduledTimer);
            this.#scheduledTimer = null;
        }

        if (this.#eventQueue.length === 0) return;

        const now = Date.now();
        const nextTriggerTime =
            this.#eventQueue.nextEvent!.triggerTime.getTime();
        const delay = Math.max(nextTriggerTime - now, 0);

        this.#scheduledTimer = setTimeoutWithErrorHandling(
            async () => {
                await this.#flushEvents();
                this.#scheduleNextEvent();
            },
            delay,
            { status: this.status },
        );
    }

    /**
     * Processes and dispatches events from the event queue that are due to be triggered.
     *
     * This method iterates through the event queue and checks if the trigger time of the
     * next event is less than or equal to the current time (in seconds). If so, the event
     * is removed from the queue, processed, and dispatched. The method also updates the
     * node's status to indicate the event has been sent.
     */
    async #flushEvents() {
        const nowSecond = Math.floor(Date.now() / 1000);
        const offsetMs = (await this.#getOffsetMs()) ?? 0;

        while (this.#eventQueue.length > 0) {
            const nextEvent = this.#eventQueue.nextEvent!;
            const eventSecond = Math.floor(
                nextEvent.triggerTime.getTime() / 1000,
            );

            if (eventSecond > nowSecond) break;

            // Remove from queue
            this.#eventQueue.shift();

            // Double-check not to re-emit
            if (this.#sentCache.has(nextEvent.event.uniqueId)) {
                continue;
            }

            // Dispatch event
            const message = {};
            await this.setCustomOutputs(
                this.node.config.outputProperties,
                message,
                { calendarItem: nextEvent.event.convertToObject() },
            );
            this.node.send(message);
            this.status.setSuccess(
                RED._('ha-events-calendar.status.sent', {
                    summary: shortenString(nextEvent.event.summary, 32),
                }),
            );

            // Mark as sent
            this.#sentCache.mark(
                nextEvent.event,
                offsetMs,
                EventsCalendarController.OVERLAP_MS,
            );
        }
    }

    /**
     * Polls for new events, processes them, and schedules the next event.
     *
     * This method performs the following steps:
     * 1. Retrieves the next time window for fetching events.
     * 2. Fetches new events within the specified time window.
     * 3. Merges the new events into the event queue, ensuring no duplicates by comparing unique IDs.
     * 4. Sorts the event queue by the trigger time of each event.
     * 5. Dispatches events that are already eligible for processing (catch-up).
     * 6. Schedules the next upcoming event based on the updated event queue.
     *
     * This method is asynchronous and ensures that the event queue is kept up-to-date
     * and that events are processed in a timely manner.
     */
    async #poll() {
        // Prune before polling/merging
        this.#sentCache.prune();

        const span = await this.#getNextWindow();
        const newEvents = await this.#fetchEvents(span);

        await this.#processFetchedEvents(newEvents);

        // Update status based on queue length
        this.#updateQueueStatus();

        // Dispatch and schedule
        await this.#flushEvents();
        this.#scheduleNextEvent();
    }

    /**
     * Processes the fetched events by attempting to add each to the internal queue
     * if it hasn't been queued or processed already, and returns the count of
     * successfully added events.
     * @param events - An array of QueuedCalendarEvent objects to process.
     * @returns The number of events that were successfully added to the queue.
     */
    async #processFetchedEvents(events: ICalendarItem[]): Promise<number> {
        let addedCount = 0;

        for (const event of events) {
            const validatedEvent = await this.#evaluateEvent(event);
            if (validatedEvent && this.#eventQueue.add(validatedEvent)) {
                addedCount++;
            }
        }

        return addedCount;
    }

    /**
     * Updates the node's status to reflect the current event queue state.
     *
     * - If there are multiple events queued, displays a message indicating the count.
     * - If there is one event queued, displays a message for a single queued event.
     * - If the queue is empty, displays a message indicating no events are queued, including the poll interval in minutes.
     */
    #updateQueueStatus() {
        const queueLength = this.#eventQueue.length;
        if (queueLength > 1) {
            this.status.setSending([
                'ha-events-calendar.status.queued-multi',
                {
                    count: this.#eventQueue.length,
                },
            ]);
        } else if (queueLength > 0) {
            this.status.setSending('ha-events-calendar.status.queued-one');
        } else {
            this.status.setSending([
                'ha-events-calendar.status.queued-none',
                {
                    minutes: EventsCalendarController.POLL_INTERVAL_MS / 60000,
                },
            ]);
        }
    }
}
