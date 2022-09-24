import { DateTimeFormatOptions } from '../types/DateTimeFormatOptions';

const fallbackLocale = 'en-US';
const defaultLocale = Intl?.DateTimeFormat()?.resolvedOptions()?.locale;
const defaultOptions: DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

export function formatDate({
    date = new Date(),
    locale = defaultLocale ?? fallbackLocale,
    options = defaultOptions,
}): string {
    return new Intl.DateTimeFormat(locale, options).format(date);
}
