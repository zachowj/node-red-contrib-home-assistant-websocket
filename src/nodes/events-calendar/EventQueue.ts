import { QueuedCalendarEvent } from './EventsCalendarController';
import SentEventCache from './SentEventCache';

export default class EventQueue {
    #events: QueuedCalendarEvent[] = [];
    #sentCache: SentEventCache;

    constructor(sentCache: SentEventCache) {
        this.#sentCache = sentCache;
    }

    get length(): number {
        return this.#events.length;
    }

    get nextEvent(): QueuedCalendarEvent | undefined {
        return this.#events[0];
    }

    public add(event: QueuedCalendarEvent): boolean {
        // Return true if added, false if duplicate
        if (
            this.hasEvent(event.event.uniqueId) ||
            this.#sentCache.has(event.event.uniqueId)
        ) {
            return false;
        }
        this.#events.push(event);
        this.sort();
        return true;
    }

    public hasEvent(id: string): boolean {
        return this.#events.some((e) => e.event.uniqueId === id);
    }

    public sort() {
        this.#events.sort(
            (a, b) => a.triggerTime.getTime() - b.triggerTime.getTime(),
        );
    }

    public shift(): QueuedCalendarEvent | undefined {
        return this.#events.shift();
    }

    public clear() {
        this.#events = [];
    }
}
