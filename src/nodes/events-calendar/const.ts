import { ComparatorType, TypedInputTypes } from '../../const';

export enum TargetType {
    ThisEntity = 'this_entity',
    EntityId = 'entity_id',
}

export enum PropertyType {
    CurrentState = 'current_state',
    PreviousState = 'previous_state',
    Property = 'property',
}

export interface Constraint {
    targetType: TargetType;
    targetValue: string;
    propertyType: PropertyType;
    propertyValue: string;
    comparatorType: ComparatorType;
    comparatorValueDatatype: TypedInputTypes;
    comparatorValue: string;
}

// Define type aliases
type WithDateTime = {
    dateTime: string;
};

type WithDate = {
    date: string;
};

// Create a union type
type DateOrDateTime = WithDateTime | WithDate;

// Type guard for WithDateTime
function isWithDateTime(obj: any): obj is WithDateTime {
    return obj && typeof obj.dateTime === 'string';
}

// Type guard for WithDate
function isWithDate(obj: any): obj is WithDate {
    return obj && typeof obj.date === 'string';
}

// Function to handle the conversion at runtime
function toDate(obj: DateOrDateTime): Date {
    if (isWithDateTime(obj)) {
        return new Date(obj.dateTime);
    } else if (isWithDate(obj)) {
        return new Date(obj.date);
    }
    throw new Error('Invalid object');
}

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
        return eventType === 'start' ? toDate(this.start) : toDate(this.end);
    }
}

export function createCalendarItem(data: ICalendarItem): CalendarItem {
    return new CalendarItem(data);
}
