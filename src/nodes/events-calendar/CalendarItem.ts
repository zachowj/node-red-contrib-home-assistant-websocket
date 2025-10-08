import crypto from 'crypto';

import { CalendarEventType, DateOrDateTime } from './const';
import { isWithDate, parseCalendarDate, toLocalISOWithOffset } from './helpers';

// Raw data from Home Assistant API
export interface RawCalendarItem {
    start: DateOrDateTime;
    end: DateOrDateTime;
    summary: string;
    description?: string | null;
    location?: string | null;
    uid?: string | null;
    recurrence_id?: string | null;
    rrule?: string | null;
}

// Public interface with both properties and methods
export interface ICalendarItem {
    readonly start: DateOrDateTime;
    readonly end: DateOrDateTime;
    readonly summary: string;
    readonly description?: string;
    readonly location?: string;
    readonly uid?: string;
    readonly recurrence_id?: string;
    readonly rrule?: string;
    readonly uniqueId: string;
    readonly isAllDayEvent: boolean;
    date(eventType: CalendarEventType): Date;
    convertToObject(): Record<string, any>;
}

export default class CalendarItem implements ICalendarItem {
    #start: DateOrDateTime;
    #end: DateOrDateTime;
    #summary: string;
    #description?: string;
    #location?: string;
    #uid?: string;
    #recurrence_id?: string;
    #rrule?: string;

    /**
     * CalendarItem encapsulates a calendar entry. Inputs are stored privately
     * and exposed via getters to keep instances immutable from the outside.
     */
    constructor(data: RawCalendarItem) {
        this.#start = data.start;
        this.#end = data.end;
        this.#summary = data.summary ?? '';
        this.#description = data.description ?? undefined;
        this.#location = data.location ?? undefined;
        this.#uid = data.uid ?? undefined;
        this.#recurrence_id = data.recurrence_id ?? undefined;
        this.#rrule = data.rrule ?? undefined;
    }

    get start(): DateOrDateTime {
        return this.#start;
    }

    get end(): DateOrDateTime {
        return this.#end;
    }

    get summary(): string {
        return this.#summary;
    }

    get description(): string | undefined {
        return this.#description;
    }

    get location(): string | undefined {
        return this.#location;
    }

    get uid(): string | undefined {
        return this.#uid;
    }

    get recurrence_id(): string | undefined {
        return this.#recurrence_id;
    }

    get rrule(): string | undefined {
        return this.#rrule;
    }

    get isAllDayEvent(): boolean {
        return isWithDate(this.#start) && isWithDate(this.#end);
    }

    get uniqueId(): string {
        if (this.#uid) {
            return `${this.#uid}${this.#recurrence_id ?? ''}`;
        }

        // Combine fallback fields
        const start = this.date(CalendarEventType.Start).toISOString();
        const end = this.date(CalendarEventType.End).toISOString();
        const summary = this.#summary;

        const data = `${start}|${end}|${summary}`;

        // Hash it to get a compact, stable identifier
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex')
            .slice(0, 16); // shorten to 16 chars
    }

    /**
     * Return the Date for the requested event type (start or end).
     */
    public date(eventType: CalendarEventType): Date {
        const eventDate =
            eventType === CalendarEventType.Start ? this.#start : this.#end;
        return parseCalendarDate(eventDate);
    }

    /**
     * Convert to a plain object suitable for sending or logging.
     * Includes computed properties.
     */
    public convertToObject(): Record<string, any> {
        return {
            start: toLocalISOWithOffset(this.date(CalendarEventType.Start)),
            end: toLocalISOWithOffset(this.date(CalendarEventType.End)),
            summary: this.#summary,
            description: this.#description,
            location: this.#location,
            uid: this.#uid,
            recurrence_id: this.#recurrence_id,
            rrule: this.#rrule,
            all_day: this.isAllDayEvent,
        };
    }
}

export function createCalendarItem(data: RawCalendarItem): CalendarItem {
    return new CalendarItem(data);
}
