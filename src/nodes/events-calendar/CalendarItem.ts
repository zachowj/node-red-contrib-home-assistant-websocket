import { CalendarEventType, DateOrDateTime } from './const';
import { isWithDate, parseCalendarDate, toLocalISOWithOffset } from './helpers';

export interface ICalendarItem {
    start: DateOrDateTime;
    end: DateOrDateTime;
    summary: string;
    description: string;
    location: string | null | undefined;
    uid: string;
    recurrence_id: string | null | undefined;
    rrule: string | null | undefined;
    uniqueId: string;
    isAllDayEvent: boolean;
    date(eventType: CalendarEventType): Date;
    convertToObject(): Record<string, any>;
}

export default class CalendarItem implements ICalendarItem {
    #start: DateOrDateTime;
    #end: DateOrDateTime;
    #summary: string;
    #description: string;
    #location: string | null | undefined;
    #uid: string;
    #recurrence_id: string | null | undefined;
    #rrule: string | null | undefined;

    /**
     * CalendarItem encapsulates a calendar entry. Inputs are stored privately
     * and exposed via getters to keep instances immutable from the outside.
     */
    constructor(data: ICalendarItem) {
        if (!data || !data.uid) {
            throw new Error('CalendarItem requires a uid.');
        }
        this.#start = data.start;
        this.#end = data.end;
        this.#summary = data.summary ?? '';
        this.#description = data.description ?? '';
        this.#location = data.location ?? null;
        this.#uid = data.uid;
        this.#recurrence_id = data.recurrence_id ?? null;
        this.#rrule = data.rrule ?? null;
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

    get description(): string {
        return this.#description;
    }

    get location(): string | null | undefined {
        return this.#location;
    }

    get uid(): string {
        return this.#uid;
    }

    get recurrence_id(): string | null | undefined {
        return this.#recurrence_id;
    }

    get rrule(): string | null | undefined {
        return this.#rrule;
    }

    get isAllDayEvent(): boolean {
        return isWithDate(this.#start) && isWithDate(this.#end);
    }

    get uniqueId(): string {
        return `${this.#uid}${this.#recurrence_id ?? ''}`;
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
            isAllDayEvent: this.isAllDayEvent,
        };
    }
}

export function createCalendarItem(data: ICalendarItem): CalendarItem {
    return new CalendarItem(data);
}
