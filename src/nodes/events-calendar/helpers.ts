import { DateOrDateTime, WithDate, WithDateTime } from './const';

/**
 * Returns true if the input is an all-day date (has `date` property).
 */
export function isWithDate(input: DateOrDateTime): input is WithDate {
    return (input as WithDate).date !== undefined;
}

/**
 * Returns true if the input has a dateTime (normal event).
 */
export function isWithDateTime(input: DateOrDateTime): input is WithDateTime {
    return (input as WithDateTime).dateTime !== undefined;
}

/**
 * Parse a Calendar DateOrDateTime into a JS Date.
 * All-day events (date) are returned at midnight local time.
 */
export function parseCalendarDate(input: DateOrDateTime): Date {
    if (isWithDate(input)) {
        // All-day event: return at midnight local time
        const [year, month, day] = input.date.split('-').map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    } else if (isWithDateTime(input)) {
        // Normal event: parse the datetime string
        return new Date(input.dateTime);
    }
    throw new Error('Invalid Calendar DateOrDateTime');
}

export function toLocalISOWithOffset(
    date: Date,
    withMilliseconds: boolean = false,
): string {
    const pad = (num: number, size: number = 2): string =>
        String(num).padStart(size, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    let iso = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    if (withMilliseconds) {
        iso += `.${pad(date.getMilliseconds(), 3)}`;
    }

    // Calculate timezone offset
    const offsetMinutes = date.getTimezoneOffset();
    const sign = offsetMinutes <= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
    const offsetMins = pad(Math.abs(offsetMinutes) % 60);

    iso += `${sign}${offsetHours}:${offsetMins}`;

    return iso;
}

export function shortenString(s: string, maxLength: number): string {
    if (s.length <= maxLength) {
        return s;
    }
    return s.slice(0, maxLength - 3) + '...';
}

export function alignDateToMidnight(date: Date): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
        0,
    );
}

/**
 * Checks if the given trigger time is in the past.
 * @param triggerTime - The trigger time to check.
 * @param now - The current time in milliseconds.
 * @returns True if the trigger time is in the past, false otherwise.
 */
export function isTriggerTimeInPast(triggerTime: Date, now: number): boolean {
    // Convert both timestamps to seconds (truncating milliseconds)
    const triggerTimeSeconds = Math.floor(triggerTime.getTime() / 1000);
    const nowSeconds = Math.floor(now / 1000);

    // Compare at second level
    return triggerTimeSeconds < nowSeconds;
}
