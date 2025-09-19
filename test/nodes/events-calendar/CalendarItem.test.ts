import { describe, expect, it } from 'vitest';

import { createCalendarItem } from '../../../src/nodes/events-calendar/CalendarItem';
import { CalendarEventType } from '../../../src/nodes/events-calendar/const';
import { toLocalISOWithOffset } from '../../../src/nodes/events-calendar/helpers';

describe('CalendarItem', () => {
    it('should throw when created without a uid', () => {
        expect(() => createCalendarItem({} as any)).toThrow(/uid/i);
    });

    it('should expose getters, date() and uniqueId correctly for normal Date inputs', () => {
        const start = { dateTime: '2025-09-19T10:00:00Z' };
        const end = { dateTime: '2025-09-19T11:00:00Z' };

        const data = {
            start,
            end,
            summary: 'Team Meeting',
            description: 'Discuss roadmap',
            location: 'Conference Room',
            uid: 'abc123',
            recurrence_id: 'r1',
            rrule: null,
        } as any;

        const item = createCalendarItem(data);

        expect(item.start).toEqual(start);
        expect(item.end).toEqual(end);
        expect(item.summary).toBe('Team Meeting');
        expect(item.description).toBe('Discuss roadmap');
        expect(item.location).toBe('Conference Room');
        expect(item.uid).toBe('abc123');
        expect(item.recurrence_id).toBe('r1');
        expect(item.rrule).toBeNull();
        expect(item.uniqueId).toBe('abc123r1');
        expect(item.isAllDayEvent).toBe(false);

        // ensure the returned values are Dates before using Date methods
        expect(item.date(CalendarEventType.Start)).toBeInstanceOf(Date);
        expect(item.date(CalendarEventType.End)).toBeInstanceOf(Date);
    });

    it('should return serializable fields', () => {
        const start = { dateTime: '2025-09-19T10:00:00Z' };
        const end = { dateTime: '2025-09-19T11:00:00Z' };

        const data = {
            start,
            end,
            summary: 'Standup',
            description: 'Daily sync',
            location: null,
            uid: 'u1',
            recurrence_id: null,
            rrule: null,
        } as any;

        const item = createCalendarItem(data);
        const obj = item.convertToObject();

        // required keys
        expect(typeof obj.start).toBe('string');
        expect(typeof obj.end).toBe('string');
        expect(obj.summary).toBe('Standup');
        expect(obj.description).toBe('Daily sync');
        expect(obj.location).toBeNull();
        expect(obj.uid).toBe('u1');
        expect(obj.recurrence_id).toBeNull();
        expect(obj.rrule).toBeNull();
        expect(obj.isAllDayEvent).toBe(false);

        // start/end should be parseable as dates
        expect(isNaN(Date.parse(obj.start))).toBe(false);
        expect(isNaN(Date.parse(obj.end))).toBe(false);
    });

    // Additional tests

    it('should default optional fields when omitted', () => {
        const start = { dateTime: '2025-09-19T10:00:00Z' };
        const end = { dateTime: '2025-09-19T11:00:00Z' };

        const data = {
            start,
            end,
            uid: 'minimal',
        } as any;

        const item = createCalendarItem(data);

        expect(item.summary).toBe('');
        expect(item.description).toBe('');
        expect(item.location).toBeNull();
        expect(item.recurrence_id).toBeNull();
        expect(item.rrule).toBeNull();
        expect(item.uniqueId).toBe('minimal');
        expect(item.isAllDayEvent).toBe(false);

        const obj = item.convertToObject();
        expect(typeof obj.start).toBe('string');
        expect(isNaN(Date.parse(obj.start))).toBe(false);
    });

    it('should treat date-only inputs as all-day events and serialize them', () => {
        const start = { date: '2025-09-19' };
        const end = { date: '2025-09-19' };

        const data = {
            start,
            end,
            summary: 'Holiday',
            description: '',
            location: null,
            uid: 'allDay1',
            recurrence_id: null,
            rrule: null,
        } as any;

        const item = createCalendarItem(data);

        expect(item.isAllDayEvent).toBe(true);
        const startDate = item.date(CalendarEventType.Start);
        expect(startDate instanceof Date).toBe(true);

        const obj = item.convertToObject();
        expect(typeof obj.start).toBe('string');
        expect(isNaN(Date.parse(obj.start))).toBe(false);
        // date-only serialization should include the date portion
        expect(obj.start).toContain('2025-09-19');
    });

    it('should not append "undefined" to uniqueId when recurrence_id is omitted', () => {
        const start = new Date('2025-09-19T12:00:00Z');
        const end = new Date('2025-09-19T13:00:00Z');

        const data = {
            start,
            end,
            uid: 'noRecurrence',
            // recurrence_id intentionally omitted
        } as any;

        const item = createCalendarItem(data);
        expect(item.recurrence_id).toBeNull();
        expect(item.uniqueId).toBe('noRecurrence');
    });

    it('should serialize start/end using local ISO with timezone offset', () => {
        const data = {
            start: { dateTime: '2025-09-19T10:00:00Z' },
            end: { dateTime: '2025-09-19T11:00:00Z' },
            uid: 'tz1',
        } as any;

        const item = createCalendarItem(data);
        const obj = item.convertToObject();

        const expectedStart = toLocalISOWithOffset(
            item.date(CalendarEventType.Start),
        );
        const expectedEnd = toLocalISOWithOffset(
            item.date(CalendarEventType.End),
        );

        expect(obj.start).toBe(expectedStart);
        expect(obj.end).toBe(expectedEnd);
        // uniqueId is intentionally not included in convertToObject
        expect((obj as any).uniqueId).toBeUndefined();
    });

    it('should not be all-day when only one of start/end is a date', () => {
        const data = {
            start: { date: '2025-09-19' }, // all-day
            end: { dateTime: '2025-09-19T11:00:00Z' }, // timed
            uid: 'mix1',
        } as any;

        const item = createCalendarItem(data);
        expect(item.isAllDayEvent).toBe(false);

        // Ensure date() respects eventType for mixed inputs
        expect(item.date(CalendarEventType.Start)).toBeInstanceOf(Date);
        expect(item.date(CalendarEventType.End)).toBeInstanceOf(Date);
    });

    it('should coerce undefined location to null', () => {
        const data = {
            start: { dateTime: '2025-09-19T10:00:00Z' },
            end: { dateTime: '2025-09-19T11:00:00Z' },
            uid: 'loc1',
            // location intentionally undefined
        } as any;

        const item = createCalendarItem(data);
        expect(item.location).toBeNull();
        expect(item.convertToObject().location).toBeNull();
    });

    it('should include recurrence_id in uniqueId when provided', () => {
        const data = {
            start: { dateTime: '2025-09-19T10:00:00Z' },
            end: { dateTime: '2025-09-19T11:00:00Z' },
            uid: 'idXYZ',
            recurrence_id: 'r42',
        } as any;

        const item = createCalendarItem(data);
        expect(item.uniqueId).toBe('idXYZr42');
    });

    it('should return the end date when eventType is End', () => {
        const start = { dateTime: '2025-09-19T10:00:00Z' };
        const end = { dateTime: '2025-09-19T11:00:00Z' };
        const item = createCalendarItem({ start, end, uid: 'end1' } as any);

        const dEnd = item.date(CalendarEventType.End);
        expect(dEnd).toBeInstanceOf(Date);
        expect(dEnd.toISOString()).toBe('2025-09-19T11:00:00.000Z');
    });
});
