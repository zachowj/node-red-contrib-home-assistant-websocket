import { beforeEach, describe, expect, it, vi } from 'vitest';

import CalendarItem from '../../../../src/nodes/events-calendar/CalendarItem';
import EventQueue from '../../../../src/nodes/events-calendar/EventQueue';
import { QueuedCalendarEvent } from '../../../../src/nodes/events-calendar/EventsCalendarController';
import SentEventCache from '../../../../src/nodes/events-calendar/SentEventCache';

describe('EventQueue', () => {
    let queue: EventQueue;
    let sentCache: SentEventCache;
    let mockEvent1: QueuedCalendarEvent;
    let mockEvent2: QueuedCalendarEvent;
    let mockEvent3: QueuedCalendarEvent;

    beforeEach(() => {
        sentCache = {
            has: vi.fn(),
            add: vi.fn(),
            clear: vi.fn(),
        } as unknown as SentEventCache;

        queue = new EventQueue(sentCache);

        // Create proper CalendarItem instances with the correct structure
        const mockCalendarItem1 = new CalendarItem({
            uid: 'event1',
            start: { dateTime: '2023-01-01T10:00:00Z' },
            end: { dateTime: '2023-01-01T11:00:00Z' },
            summary: 'Test Event 1',
            description: 'Description 1',
            location: 'Location 1',
            recurrence_id: null,
            rrule: null,
        });

        const mockCalendarItem2 = new CalendarItem({
            uid: 'event2',
            start: { dateTime: '2023-01-01T11:00:00Z' },
            end: { dateTime: '2023-01-01T12:00:00Z' },
            summary: 'Test Event 2',
            description: 'Description 2',
            location: 'Location 2',
            recurrence_id: null,
            rrule: null,
        });

        const mockCalendarItem3 = new CalendarItem({
            uid: 'event3',
            start: { dateTime: '2023-01-01T09:00:00Z' },
            end: { dateTime: '2023-01-01T10:00:00Z' },
            summary: 'Test Event 3',
            description: 'Description 3',
            location: 'Location 3',
            recurrence_id: null,
            rrule: null,
        });

        mockEvent1 = {
            event: mockCalendarItem1,
            triggerTime: new Date('2023-01-01T10:00:00Z'),
        };

        mockEvent2 = {
            event: mockCalendarItem2,
            triggerTime: new Date('2023-01-01T11:00:00Z'),
        };

        mockEvent3 = {
            event: mockCalendarItem3,
            triggerTime: new Date('2023-01-01T09:00:00Z'),
        } as QueuedCalendarEvent;
    });

    describe('add', () => {
        it('should add an event to the queue and return true', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            const result = queue.add(mockEvent1);

            expect(result).toBe(true);
            expect(queue.length).toBe(1);
            expect(queue.nextEvent).toEqual(mockEvent1);
            expect(sentCache.has).toHaveBeenCalledWith('event1');
        });

        it('should not add a duplicate event and return false', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            queue.add(mockEvent1);
            const result = queue.add(mockEvent1);

            expect(result).toBe(false);
            expect(queue.length).toBe(1);
            expect(sentCache.has).toHaveBeenCalledWith('event1');
        });

        it('should not add an event that exists in sent cache and return false', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(true);

            const result = queue.add(mockEvent1);

            expect(result).toBe(false);
            expect(queue.length).toBe(0);
            expect(sentCache.has).toHaveBeenCalledWith('event1');
        });

        it('should sort events by trigger time when adding multiple events', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            // Add events in reverse chronological order
            queue.add(mockEvent2);
            queue.add(mockEvent1);

            // Verify they are sorted by trigger time
            expect(queue.length).toBe(2);
            expect(queue.nextEvent).toEqual(mockEvent1); // Earlier time should be first
        });
    });

    describe('hasEvent', () => {
        it('should return true when event with id exists in queue', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);
            queue.add(mockEvent1);

            expect(queue.hasEvent('event1')).toBe(true);
        });

        it('should return false when event with id does not exist in queue', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);
            queue.add(mockEvent1);

            expect(queue.hasEvent('nonexistent')).toBe(false);
        });

        it('should return false for empty queue', () => {
            expect(queue.hasEvent('event1')).toBe(false);
        });
    });

    describe('sort', () => {
        it('should sort events by trigger time', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            // Add events in mixed order
            queue.add(mockEvent2); // 11:00
            queue.add(mockEvent1); // 10:00
            queue.add(mockEvent3); // 09:00

            // Explicitly call sort (normally called by add)
            queue.sort();

            // Verify order
            expect(queue.nextEvent).toEqual(mockEvent3); // 09:00 should be first

            // Shift and check next
            queue.shift();
            expect(queue.nextEvent).toEqual(mockEvent1); // 10:00 should be next

            // Shift and check final
            queue.shift();
            expect(queue.nextEvent).toEqual(mockEvent2); // 11:00 should be last
        });

        it('should handle empty queue', () => {
            // Should not throw an error
            expect(() => queue.sort()).not.toThrow();
        });

        it('should handle events with identical trigger times', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            const sameTimeEvent1 = {
                ...mockEvent1,
                triggerTime: new Date('2023-01-01T10:00:00Z'),
            };
            const sameTimeEvent2 = {
                ...mockEvent2,
                triggerTime: new Date('2023-01-01T10:00:00Z'),
            };

            queue.add(sameTimeEvent2);
            queue.add(sameTimeEvent1);

            // With same time, order is preserved by insertion order
            expect(queue.length).toBe(2);
            // No specific assertion on order since it's not deterministic with same times
        });
    });

    describe('shift', () => {
        it('should remove and return the first event', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            queue.add(mockEvent1);
            queue.add(mockEvent2);

            const shifted = queue.shift();

            expect(shifted).toEqual(mockEvent1);
            expect(queue.length).toBe(1);
            expect(queue.nextEvent).toEqual(mockEvent2);
        });

        it('should return undefined for empty queue', () => {
            const shifted = queue.shift();

            expect(shifted).toBeUndefined();
            expect(queue.length).toBe(0);
        });
    });

    describe('clear', () => {
        it('should remove all events from the queue', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            queue.add(mockEvent1);
            queue.add(mockEvent2);

            expect(queue.length).toBe(2);

            queue.clear();

            expect(queue.length).toBe(0);
            expect(queue.nextEvent).toBeUndefined();
        });

        it('should handle clearing an already empty queue', () => {
            expect(queue.length).toBe(0);

            // Should not throw an error
            expect(() => queue.clear()).not.toThrow();

            expect(queue.length).toBe(0);
        });
    });

    describe('nextEvent', () => {
        it('should return undefined for empty queue', () => {
            expect(queue.nextEvent).toBeUndefined();
        });

        it('should return first event without removing it', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            queue.add(mockEvent1);
            queue.add(mockEvent2);

            expect(queue.nextEvent).toEqual(mockEvent1);
            expect(queue.length).toBe(2); // Length should remain the same

            // Check again - should still return the same event
            expect(queue.nextEvent).toEqual(mockEvent1);
        });
    });

    describe('length', () => {
        it('should return 0 for empty queue', () => {
            expect(queue.length).toBe(0);
        });

        it('should return correct count after adding events', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            queue.add(mockEvent1);
            expect(queue.length).toBe(1);

            queue.add(mockEvent2);
            expect(queue.length).toBe(2);
        });

        it('should return correct count after removing events', () => {
            vi.spyOn(sentCache, 'has').mockReturnValue(false);

            queue.add(mockEvent1);
            queue.add(mockEvent2);
            expect(queue.length).toBe(2);

            queue.shift();
            expect(queue.length).toBe(1);

            queue.shift();
            expect(queue.length).toBe(0);
        });
    });
});
