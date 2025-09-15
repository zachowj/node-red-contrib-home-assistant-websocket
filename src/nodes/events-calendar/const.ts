// Define type aliases
export type WithDateTime = {
    dateTime: string;
};

export type WithDate = {
    date: string;
};

// Create a union type
export type DateOrDateTime = WithDateTime | WithDate;

export enum CalendarEventType {
    Start = 'start',
    End = 'end',
}
