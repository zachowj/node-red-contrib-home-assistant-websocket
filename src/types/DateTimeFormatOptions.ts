/**
 * Better DateTimeFormatOptions types
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat for representation details
 */
export interface DateTimeFormatOptions extends Intl.DateTimeFormatOptions {
    fractionalSecondDigits?: 0 | 1 | 2 | 3;
}
