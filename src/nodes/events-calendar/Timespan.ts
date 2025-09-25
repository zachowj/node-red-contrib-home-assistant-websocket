/**
 * Represents a time window with a start and end.
 */
export default class Timespan {
    #start: Date = new Date(0);
    #end: Date = new Date(0);

    /**
     * Aligns the given date to midnight (00:00:00.000) of the same day.
     *
     * @param date - The date to be aligned to midnight.
     * @returns A new `Date` object representing midnight of the same day as the input date.
     */
    static alignToMidnight(date: Date): Date {
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

    constructor(start?: Date, end?: Date) {
        if (start) {
            this.#start = start;
        }
        if (end) {
            this.#end = end;
        }
    }

    get start(): Date {
        return this.#start;
    }

    get end(): Date {
        return this.#end;
    }

    /**
     * Creates a new `Timespan` instance with the start and end times adjusted by the specified offset.
     *
     * @param offsetMs - The offset in milliseconds to apply to the start and end times.
     * @returns A new `Timespan` instance with the adjusted start and end times.
     */
    public withOffset(offsetMs: number): Timespan {
        return new Timespan(
            new Date(this.start.getTime() + offsetMs),
            new Date(this.end.getTime() + offsetMs),
        );
    }

    /**
     * Calculates the next upcoming timespan based on the current instance's end time,
     * the provided interval, and optional alignment to midnight.
     *
     * @param now - The current date and time used as a reference point.
     * @param intervalMs - The interval in milliseconds to add to the timespan.
     *
     * @returns A new `Timespan` instance representing the next upcoming timespan.
     */
    public nextUpcoming(now: Date, intervalMs: number): Timespan {
        const newStart = Timespan.alignToMidnight(this.end);
        const newEnd = new Date(
            Math.max(this.end.getTime(), now.getTime()) + intervalMs,
        );

        return new Timespan(newStart, newEnd);
    }
}
