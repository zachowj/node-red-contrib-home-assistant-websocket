import { DateTimeFormatOptions } from '../../types/DateTimeFormatOptions';
import { ServerNodeConfig } from '../../types/nodes';

export const getStatusOptions = (
    config: Partial<ServerNodeConfig>
): DateTimeFormatOptions => {
    const options: DateTimeFormatOptions = {
        year: config?.statusYear === 'hidden' ? undefined : config?.statusYear,
        month:
            config?.statusMonth === 'hidden'
                ? undefined
                : config?.statusMonth ?? 'short',
        day:
            config?.statusDay === 'hidden'
                ? undefined
                : config?.statusDay ?? 'numeric',
        hourCycle:
            config?.statusHourCycle === 'default'
                ? undefined
                : config?.statusHourCycle ?? 'h23',
        hour: 'numeric',
        minute: 'numeric',
    };

    switch (config?.statusTimeFormat) {
        case 'h:m:s':
            options.second = 'numeric';
            break;
        case 'h:m:s.ms':
            options.second = 'numeric';
            options.fractionalSecondDigits = 3;
            break;
    }

    return options;
};
