import ConfigError from '../../common/errors/ConfigError';
import { EventsAllNodeProperties } from '.';

export function validateConfig(config: EventsAllNodeProperties) {
    if (config.eventData) {
        try {
            JSON.parse(config.eventData);
        } catch (e) {
            throw new ConfigError('server-events.error.invalid_json');
        }
    }
}
