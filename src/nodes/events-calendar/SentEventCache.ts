import CalendarItem from './CalendarItem';
import { CalendarEventType } from './const';
import Timespan from './Timespan';

export default class SentEventCache {
    // uniqueId -> expiryAt (ms since epoch)
    #map = new Map<string, number>();

    // Mark an event as sent
    public mark(event: CalendarItem, offsetMs: number, overlapMs: number) {
        const expiry = this.#computeExpiryMs(event, offsetMs, overlapMs);
        this.#map.set(event.uniqueId, expiry);
    }

    // Check if an event was sent and not yet expired (lazy prune)
    public has(id: string, now = Date.now()): boolean {
        const expiry = this.#map.get(id);
        if (expiry === undefined) return false;
        if (now > expiry) {
            this.#map.delete(id);
            return false;
        }
        return true;
    }

    // Drop all expired entries
    public prune(now = Date.now()) {
        for (const [id, expiry] of this.#map) {
            if (now > expiry) this.#map.delete(id);
        }
    }

    public clear() {
        this.#map.clear();
    }

    // Compute expiry: event end (aligned if all-day) + offset + overlap
    #computeExpiryMs(
        event: CalendarItem,
        offsetMs: number,
        overlapMs: number,
    ): number {
        let end = event.date(CalendarEventType.End);
        if (event.isAllDayEvent) {
            end = Timespan.alignToMidnight(end);
        }
        return end.getTime() + offsetMs + overlapMs;
    }
}
