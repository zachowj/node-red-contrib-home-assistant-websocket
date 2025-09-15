import { CalendarEventType, DateOrDateTime } from './const';
import { toDate } from './helpers';

export interface ICalendarItem {
    start: DateOrDateTime;
    end: DateOrDateTime;
    summary: string;
    description: string;
    location?: string | null;
    uid: string;
    recurrence_id?: string | null;
    rrule?: string | null;
    queueIndex(): string;
    date(eventType: string): Date;
}

export class CalendarItem implements ICalendarItem {
    start!: DateOrDateTime;
    end!: DateOrDateTime;
    summary!: string;
    description!: string;
    location?: string | null;
    uid!: string;
    recurrence_id?: string | null;
    rrule?: string | null;

    constructor(data: ICalendarItem) {
        Object.assign(this, data);
    }

    queueIndex() {
        return `${this.uid}${this.recurrence_id || ''}`;
    }

    date(eventType: string): Date {
        return eventType === CalendarEventType.Start
            ? toDate(this.start)
            : toDate(this.end);
    }
}

export function createCalendarItem(data: ICalendarItem): CalendarItem {
    return new CalendarItem(data);
}
