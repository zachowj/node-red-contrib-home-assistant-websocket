// Define type aliases
type WithDateTime = {
    dateTime: string;
};

type WithDate = {
    date: string;
};

// Create a union type
export type DateOrDateTime = WithDateTime | WithDate;

// Type guard for WithDateTime
function isWithDateTime(obj: any): obj is WithDateTime {
    return obj && typeof obj.dateTime === 'string';
}

// Type guard for WithDate
function isWithDate(obj: any): obj is WithDate {
    return obj && typeof obj.date === 'string';
}

// Function to handle the conversion at runtime
export function toDate(obj: DateOrDateTime): Date {
    if (isWithDateTime(obj)) {
        return new Date(obj.dateTime);
    } else if (isWithDate(obj)) {
        return new Date(obj.date);
    }
    throw new Error('Invalid object');
}
