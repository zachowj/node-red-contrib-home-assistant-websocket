import { describe, expect, it } from 'vitest';

import Timespan from '../../../../src/nodes/events-calendar/Timespan';

describe('Timespan', () => {
    describe('withOffset', () => {
        it('should shift start and end by a positive offset without mutating the original', () => {
            const start = new Date(2025, 8, 19, 10, 0, 0, 0); // Sep 19, 2025 10:00
            const end = new Date(2025, 8, 19, 11, 0, 0, 0); // Sep 19, 2025 11:00
            const ts = new Timespan(start, end);

            const offsetMs = 60 * 60 * 1000; // +1 hour
            const shifted = ts.withOffset(offsetMs);

            expect(shifted.start.getTime()).toBe(start.getTime() + offsetMs);
            expect(shifted.end.getTime()).toBe(end.getTime() + offsetMs);

            // original remains unchanged
            expect(ts.start.getTime()).toBe(start.getTime());
            expect(ts.end.getTime()).toBe(end.getTime());

            // new instances
            expect(shifted.start).not.toBe(ts.start);
            expect(shifted.end).not.toBe(ts.end);
        });

        it('should shift start and end by a negative offset', () => {
            const start = new Date(2025, 8, 19, 10, 0, 0, 0);
            const end = new Date(2025, 8, 19, 11, 0, 0, 0);
            const ts = new Timespan(start, end);

            const offsetMs = -30 * 60 * 1000; // -30 minutes
            const shifted = ts.withOffset(offsetMs);

            expect(shifted.start.getTime()).toBe(start.getTime() + offsetMs);
            expect(shifted.end.getTime()).toBe(end.getTime() + offsetMs);
        });

        it('should leave start and end unchanged for zero offset and return new date instances', () => {
            const start = new Date(2025, 8, 19, 10, 0, 0, 0);
            const end = new Date(2025, 8, 19, 11, 0, 0, 0);
            const ts = new Timespan(start, end);

            const shifted = ts.withOffset(0);

            // values unchanged
            expect(shifted.start.getTime()).toBe(start.getTime());
            expect(shifted.end.getTime()).toBe(end.getTime());

            // new instances
            expect(shifted.start).not.toBe(start);
            expect(shifted.end).not.toBe(end);

            // original remains unchanged
            expect(ts.start).toBe(start);
            expect(ts.end).toBe(end);
        });

        it('should not mutate original Dates when applying offset', () => {
            const start = new Date(2025, 8, 19, 10, 0, 0, 0);
            const end = new Date(2025, 8, 19, 11, 0, 0, 0);
            const ts = new Timespan(start, end);

            const beforeStartMs = start.getTime();
            const beforeEndMs = end.getTime();

            ts.withOffset(5 * 60 * 1000);

            expect(start.getTime()).toBe(beforeStartMs);
            expect(end.getTime()).toBe(beforeEndMs);
        });
    });

    describe('alignToMidnight', () => {
        it('should return midnight of the same local day', () => {
            const d = new Date(2025, 11, 31, 23, 59, 59, 999); // Dec 31, 2025 23:59:59.999
            const aligned = Timespan.alignToMidnight(d);

            expect(aligned.getFullYear()).toBe(2025);
            expect(aligned.getMonth()).toBe(11);
            expect(aligned.getDate()).toBe(31);
            expect(aligned.getHours()).toBe(0);
            expect(aligned.getMinutes()).toBe(0);
            expect(aligned.getSeconds()).toBe(0);
            expect(aligned.getMilliseconds()).toBe(0);

            // original date not mutated
            expect(d.getHours()).toBe(23);
            expect(d.getMinutes()).toBe(59);
        });

        it('should handle leap day correctly (Feb 29)', () => {
            const d = new Date(2024, 1, 29, 12, 34, 56, 789); // Feb 29, 2024 (leap year)
            const aligned = Timespan.alignToMidnight(d);

            expect(aligned.getFullYear()).toBe(2024);
            expect(aligned.getMonth()).toBe(1);
            expect(aligned.getDate()).toBe(29);
            expect(aligned.getHours()).toBe(0);
            expect(aligned.getMinutes()).toBe(0);
            expect(aligned.getSeconds()).toBe(0);
            expect(aligned.getMilliseconds()).toBe(0);
        });
    });

    describe('nextUpcoming', () => {
        it('should align start to end-day midnight and set end = end + interval when now is before end', () => {
            const start = new Date(2025, 8, 19, 9, 0, 0, 0); // Sep 19, 2025 09:00
            const end = new Date(2025, 8, 19, 12, 0, 0, 0); // Sep 19, 2025 12:00
            const now = new Date(2025, 8, 19, 10, 0, 0, 0); // before end
            const intervalMs = 2 * 60 * 60 * 1000; // 2 hours

            const ts = new Timespan(start, end);
            const next = ts.nextUpcoming(now, intervalMs);

            const expectedStart = new Date(2025, 8, 19, 0, 0, 0, 0); // midnight of end's day
            const expectedEnd = new Date(end.getTime() + intervalMs);

            expect(next.start.getTime()).toBe(expectedStart.getTime());
            expect(next.end.getTime()).toBe(expectedEnd.getTime());

            // original not mutated
            expect(ts.start.getTime()).toBe(start.getTime());
            expect(ts.end.getTime()).toBe(end.getTime());
        });

        it('should align start to end-day midnight and set end = now + interval when now is after end', () => {
            const start = new Date(2025, 8, 19, 9, 0, 0, 0);
            const end = new Date(2025, 8, 19, 12, 0, 0, 0);
            const now = new Date(2025, 8, 19, 15, 0, 0, 0); // after end
            const intervalMs = 30 * 60 * 1000; // 30 minutes

            const ts = new Timespan(start, end);
            const next = ts.nextUpcoming(now, intervalMs);

            const expectedStart = new Date(2025, 8, 19, 0, 0, 0, 0); // midnight of end's day
            const expectedEnd = new Date(now.getTime() + intervalMs);

            expect(next.start.getTime()).toBe(expectedStart.getTime());
            expect(next.end.getTime()).toBe(expectedEnd.getTime());
        });

        it('should align start to midnight based on end date even across day boundaries', () => {
            const start = new Date(2025, 8, 30, 23, 0, 0, 0); // Sep 30 23:00
            const end = new Date(2025, 8, 30, 23, 30, 0, 0); // Sep 30 23:30
            const now = new Date(2025, 9, 1, 1, 0, 0, 0); // Oct 1 01:00 (after end)
            const intervalMs = 60 * 60 * 1000; // 1 hour

            const ts = new Timespan(start, end);
            const next = ts.nextUpcoming(now, intervalMs);

            // Start aligns to midnight of Sep 30 (end's day), not Oct 1 (now's day)
            const expectedStart = new Date(2025, 8, 30, 0, 0, 0, 0);
            const expectedEnd = new Date(now.getTime() + intervalMs);

            expect(next.start.getTime()).toBe(expectedStart.getTime());
            expect(next.end.getTime()).toBe(expectedEnd.getTime());
        });

        it('should set end = end + interval when now equals end', () => {
            const start = new Date(2025, 8, 19, 9, 0, 0, 0);
            const end = new Date(2025, 8, 19, 12, 0, 0, 0);
            const now = new Date(end.getTime()); // exactly equal
            const intervalMs = 45 * 60 * 1000; // 45 minutes

            const ts = new Timespan(start, end);
            const next = ts.nextUpcoming(now, intervalMs);

            const expectedStart = new Date(2025, 8, 19, 0, 0, 0, 0);
            const expectedEnd = new Date(end.getTime() + intervalMs);

            expect(next.start.getTime()).toBe(expectedStart.getTime());
            expect(next.end.getTime()).toBe(expectedEnd.getTime());
        });

        it('should align start to midnight when end is already midnight', () => {
            const start = new Date(2025, 8, 19, 0, 0, 0, 0);
            const end = new Date(2025, 8, 19, 0, 0, 0, 0); // midnight
            const now = new Date(2025, 8, 19, 6, 0, 0, 0);
            const intervalMs = 60 * 60 * 1000; // 1 hour

            const ts = new Timespan(start, end);
            const next = ts.nextUpcoming(now, intervalMs);

            const expectedStart = new Date(2025, 8, 19, 0, 0, 0, 0);
            const expectedEnd = new Date(now.getTime() + intervalMs);

            expect(next.start.getTime()).toBe(expectedStart.getTime());
            expect(next.end.getTime()).toBe(expectedEnd.getTime());
        });

        it('should not mutate original Dates when computing next window', () => {
            const start = new Date(2025, 8, 19, 9, 0, 0, 0);
            const end = new Date(2025, 8, 19, 12, 0, 0, 0);
            const now = new Date(2025, 8, 19, 10, 0, 0, 0);
            const ts = new Timespan(start, end);

            const beforeStartMs = start.getTime();
            const beforeEndMs = end.getTime();

            ts.nextUpcoming(now, 15 * 60 * 1000);

            expect(start.getTime()).toBe(beforeStartMs);
            expect(end.getTime()).toBe(beforeEndMs);
        });
    });
});
