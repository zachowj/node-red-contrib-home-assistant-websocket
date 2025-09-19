import { describe, expect, it } from 'vitest';

import { DateOrDateTime } from '../../../src/nodes/events-calendar/const';
import {
    isWithDate,
    isWithDateTime,
    parseCalendarDate,
    toLocalISOWithOffset,
} from '../../../src/nodes/events-calendar/helpers';

describe('helpers', () => {
    describe('isWithDate', () => {
        it('should return true for objects with date and false otherwise', () => {
            const a: DateOrDateTime = { date: '2025-09-19' };
            const dateTimeEvent: DateOrDateTime = {
                dateTime: '2025-09-19T10:00:00Z',
            };
            expect(isWithDate(a)).toBe(true);
            expect(isWithDate(dateTimeEvent)).toBe(false);
        });
    });

    describe('isWithDateTime', () => {
        it('should return true for objects with dateTime and false otherwise', () => {
            const a: DateOrDateTime = { dateTime: '2025-09-19T10:00:00Z' };
            const dateOnlyEvent: DateOrDateTime = { date: '2025-09-19' };
            expect(isWithDateTime(a)).toBe(true);
            expect(isWithDateTime(dateOnlyEvent)).toBe(false);
        });
    });

    describe('type guards edge cases', () => {
        it('should return false for plain objects without date or dateTime', () => {
            expect(isWithDate({} as any)).toBe(false);
            expect(isWithDateTime({} as any)).toBe(false);
        });

        it('should allow both guards to be true when both fields exist', () => {
            const both: DateOrDateTime = {
                date: '2025-09-19',
                dateTime: '2025-09-19T10:00:00Z',
            } as any;
            expect(isWithDate(both)).toBe(true);
            expect(isWithDateTime(both)).toBe(true);
        });
    });

    describe('parseCalendarDate', () => {
        it('should parse all-day dates at local midnight', () => {
            const input: DateOrDateTime = { date: '2025-09-19' };
            const d = parseCalendarDate(input);
            expect(d.getFullYear()).toBe(2025);
            expect(d.getMonth()).toBe(8); // September (0-based)
            expect(d.getDate()).toBe(19);
            expect(d.getHours()).toBe(0);
            expect(d.getMinutes()).toBe(0);
            expect(d.getSeconds()).toBe(0);
            expect(d.getMilliseconds()).toBe(0);
        });

        it('should parse dateTime strings preserving the exact instant', () => {
            const iso = '2025-09-19T10:00:00Z';
            const input: DateOrDateTime = { dateTime: iso };
            const d = parseCalendarDate(input);
            expect(d.toISOString()).toBe('2025-09-19T10:00:00.000Z');
        });

        it('should throw for invalid inputs', () => {
            // @ts-expect-error testing runtime guard
            expect(() => parseCalendarDate({})).toThrow(/invalid/i);
        });

        describe('edge cases', () => {
            it('should prefer date branch when both date and dateTime are present', () => {
                const both: DateOrDateTime = {
                    date: '2025-09-19',
                    dateTime: '2025-09-19T10:00:00Z',
                } as any;
                const d = parseCalendarDate(both);
                expect(d.getFullYear()).toBe(2025);
                expect(d.getMonth()).toBe(8);
                expect(d.getDate()).toBe(19);
                expect(d.getHours()).toBe(0);
                expect(d.getMinutes()).toBe(0);
                expect(d.getSeconds()).toBe(0);
                expect(d.getMilliseconds()).toBe(0);
            });

            it('should parse dateTime with timezone offset preserving the instant', () => {
                const input: DateOrDateTime = {
                    dateTime: '2025-09-19T10:00:00+02:00',
                };
                const d = parseCalendarDate(input);
                expect(d.toISOString()).toBe('2025-09-19T08:00:00.000Z');
            });
        });
    });

    describe('toLocalISOWithOffset', () => {
        it('should format local time with timezone offset (no milliseconds)', () => {
            const date = new Date(2025, 0, 2, 3, 4, 5, 6); // Jan 2, 2025 03:04:05.xxx local
            const actual = toLocalISOWithOffset(date, false);

            const pad = (n: number, s = 2) => String(n).padStart(s, '0');
            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());
            const offsetMinutes = date.getTimezoneOffset();
            const sign = offsetMinutes <= 0 ? '+' : '-';
            const offH = pad(Math.floor(Math.abs(offsetMinutes) / 60));
            const offM = pad(Math.abs(offsetMinutes) % 60);
            const expected = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offH}:${offM}`;

            expect(actual).toBe(expected);
        });

        it('should include milliseconds when requested', () => {
            const date = new Date(2025, 6, 4, 12, 13, 14, 123);
            const s = toLocalISOWithOffset(date, true);
            expect(s).toMatch(/\.\d{3}[+-]\d{2}:\d{2}$/);
            expect(s).toContain('.123');
        });

        describe('defaults and padding', () => {
            it('should omit milliseconds by default', () => {
                const date = new Date(2025, 0, 2, 3, 4, 5, 7);
                const s = toLocalISOWithOffset(date);
                expect(s).not.toMatch(/\.\d{3}[+-]\d{2}:\d{2}$/);
            });

            it('should pad milliseconds to 3 digits', () => {
                const date = new Date(2025, 0, 2, 3, 4, 5, 7); // 7 ms -> .007
                const s = toLocalISOWithOffset(date, true);
                expect(s).toMatch(/\.007[+-]\d{2}:\d{2}$/);
            });
        });
    });
});
