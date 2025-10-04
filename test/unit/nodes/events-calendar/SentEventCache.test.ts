import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CalendarItem from '../../../../src/nodes/events-calendar/CalendarItem';
import { CalendarEventType } from '../../../../src/nodes/events-calendar/const';
import { alignDateToMidnight } from '../../../../src/nodes/events-calendar/helpers';
import SentEventCache from '../../../../src/nodes/events-calendar/SentEventCache';

vi.mock('../../../../src/nodes/events-calendar/CalendarItem');
vi.mock('../../../../src/nodes/events-calendar/helpers', () => ({
    alignDateToMidnight: vi.fn(
        (date: Date) =>
            new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    ),
}));

const createMockEvent = (
    uniqueId: string,
    endDate: Date,
    isAllDayEvent = false,
): CalendarItem => {
    const event = new CalendarItem({
        uid: uniqueId,
        summary: 'Test Event',
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: endDate.toISOString() },
        description: 'A test event',
        location: 'Test Location',
        recurrence_id: null,
        rrule: null,
    } as any);
    vi.spyOn(event, 'uniqueId', 'get').mockReturnValue(uniqueId);
    // Some implementations expose the all-day flag under different getter names;
    // mock both variants so tests work regardless of which one is used.
    vi.spyOn(event, 'isAllDayEvent', 'get').mockReturnValue(isAllDayEvent);
    // also mock 'isAllDay' in case the implementation uses that name
    // (keeps compatibility with different CalendarItem shapes).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(event as any).isAllDay) {
        try {
            vi.spyOn(event as any, 'isAllDay', 'get').mockReturnValue(
                isAllDayEvent,
            );
        } catch {
            // If the property cannot be spied on, ignore and continue
        }
    } else {
        vi.spyOn(event as any, 'isAllDay', 'get').mockReturnValue(
            isAllDayEvent,
        );
    }
    vi.spyOn(event, 'date').mockImplementation((type) => {
        if (type === CalendarEventType.End) {
            return endDate;
        }
        return new Date();
    });
    return event;
};

describe('SentEventCache', () => {
    let cache: SentEventCache;

    beforeEach(() => {
        cache = new SentEventCache();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('mark and has', () => {
        it('should mark an event as sent and confirm it has been sent', () => {
            const now = new Date('2023-01-01T10:00:00Z');
            const event = createMockEvent(
                'event1',
                new Date('2023-01-01T11:00:00Z'),
            );
            cache.mark(event, 0, 0);
            expect(cache.has('event1', now.getTime())).toBe(true);
        });

        it('should return false for an event that has not been marked', () => {
            expect(cache.has('nonexistent')).toBe(false);
        });

        it('should return false for an event that has expired', () => {
            const eventTime = new Date('2023-01-01T10:00:00Z');
            const event = createMockEvent('event1', eventTime);
            cache.mark(event, 0, 0);
            const futureTime = new Date('2023-01-01T10:00:01Z').getTime();
            expect(cache.has('event1', futureTime)).toBe(false);
        });

        it('should correctly calculate expiry for a regular event with offset and overlap', () => {
            const endTime = new Date('2023-01-01T10:00:00Z');
            const event = createMockEvent('event1', endTime);
            const offsetMs = 5000; // 5 seconds
            const overlapMs = 2000; // 2 seconds
            cache.mark(event, offsetMs, overlapMs);

            const justBeforeExpiry =
                endTime.getTime() + offsetMs + overlapMs - 1;
            const atExpiry = endTime.getTime() + offsetMs + overlapMs;
            const justAfterExpiry =
                endTime.getTime() + offsetMs + overlapMs + 1;

            expect(cache.has('event1', justBeforeExpiry)).toBe(true);
            expect(cache.has('event1', atExpiry)).toBe(true);
            expect(cache.has('event1', justAfterExpiry)).toBe(false);
        });

        it('should correctly calculate expiry for an all-day event', () => {
            const endTime = new Date('2023-01-01T14:00:00Z'); // Middle of the day
            const event = createMockEvent('event1', endTime, true);
            cache.mark(event, 0, 0);

            const midnight = alignDateToMidnight(endTime).getTime();
            const justAfterMidnight = midnight + 1;

            expect(alignDateToMidnight).toHaveBeenCalledWith(endTime);
            cache.prune(justAfterMidnight);
            expect(cache.has('event1', justAfterMidnight)).toBe(false);
        });

        it('should delete an expired event when has() is called', () => {
            const endTime = new Date('2023-01-01T10:00:00Z');
            const event = createMockEvent('event1', endTime);
            cache.mark(event, 0, 0);

            expect(cache.has('event1', endTime.getTime())).toBe(true);

            const afterExpiry = endTime.getTime() + 1;
            cache.has('event1', afterExpiry);

            expect(cache.has('event1', afterExpiry)).toBe(false);
        });
    });

    describe('prune', () => {
        it('should remove all expired events from the cache', () => {
            const now = new Date('2023-01-02T00:00:00Z').getTime();
            const expiredEvent = createMockEvent(
                'expired',
                new Date('2023-01-01T23:59:59Z'),
            );
            const activeEvent = createMockEvent(
                'active',
                new Date('2023-01-02T00:00:01Z'),
            );

            cache.mark(expiredEvent, 0, 0);
            cache.mark(activeEvent, 0, 0);

            cache.prune(now);

            expect(cache.has('active', now)).toBe(true);
            expect(cache.has('expired', now)).toBe(false);
        });

        it('should not remove any events if none are expired', () => {
            const now = new Date('2023-01-01T00:00:00Z').getTime();
            const event1 = createMockEvent(
                'event1',
                new Date('2023-01-01T10:00:00Z'),
            );
            const event2 = createMockEvent(
                'event2',
                new Date('2023-01-01T11:00:00Z'),
            );

            cache.mark(event1, 0, 0);
            cache.mark(event2, 0, 0);

            cache.mark(event1, 0, 0);
            cache.mark(event2, 0, 0);

            cache.prune(now);

            // both events should still be present
            expect(cache.has('event1', now)).toBe(true);
            expect(cache.has('event2', now)).toBe(true);
            expect(() => cache.prune()).not.toThrow();
            expect(() => cache.prune()).not.toThrow();
            // cache should be empty
            expect(cache.has('nonexistent')).toBe(false);
        });
    });

    describe('clear', () => {
        it('should remove all events from the cache', () => {
            const event1 = createMockEvent(
                'event1',
                new Date('2023-01-01T10:00:00Z'),
            );
            const event2 = createMockEvent(
                'event2',
                new Date('2023-01-01T11:00:00Z'),
            );
            cache.mark(event1, 0, 0);
            cache.mark(event2, 0, 0);
            cache.mark(event1, 0, 0);
            cache.mark(event2, 0, 0);

            // both events should be present before clearing
            expect(
                cache.has('event1', new Date('2023-01-01T10:00:00Z').getTime()),
            ).toBe(true);
            expect(
                cache.has('event2', new Date('2023-01-01T11:00:00Z').getTime()),
            ).toBe(true);

            cache.clear();

            // cache should be empty after clear
            expect(
                cache.has('event1', new Date('2023-01-01T10:00:00Z').getTime()),
            ).toBe(false);
            expect(
                cache.has('event2', new Date('2023-01-01T11:00:00Z').getTime()),
            ).toBe(false);
        });

        it('should do nothing when clearing an empty cache', () => {
            expect(() => cache.clear()).not.toThrow();
            expect(() => cache.clear()).not.toThrow();
            // cache should still be empty
            expect(cache.has('nonexistent')).toBe(false);
        });
    });
});
