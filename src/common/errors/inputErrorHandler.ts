import Joi from 'joi';

import { RED } from '../../globals';
import { NodeDone } from '../../types/nodes';
import Status from '../status/Status';
import BaseError from './BaseError';
import HomeAssistantError, {
    isHomeAssistantApiError,
} from './HomeAssistantError';
interface Dependencies {
    done?: NodeDone;
    status?: Status;
}

export function inputErrorHandler(e: unknown, deps?: Dependencies) {
    let statusMessage = RED._('home-assistant.status.error');
    if (e instanceof Joi.ValidationError) {
        statusMessage = RED._('home-assistant.status.validation_error');
        deps?.done?.(e);
    } else if (isHomeAssistantApiError(e)) {
        deps?.done?.(new HomeAssistantError(e));
    } else if (e instanceof BaseError) {
        statusMessage = e.statusMessage;
        deps?.done?.(e);
    } else if (e instanceof Error) {
        deps?.done?.(e);
    } else if (typeof e === 'string') {
        deps?.done?.(new Error(e));
    } else {
        deps?.done?.(new Error(`Unrecognized error: ${JSON.stringify(e)}`));
    }
    deps?.status?.setFailed(statusMessage);
}

export function setTimeoutWithErrorHandling(
    callback: (...args: any[]) => void,
    timeout: number,
    deps?: Dependencies
): NodeJS.Timeout {
    const timeoutId = setTimeout(() => {
        try {
            callback();
        } catch (e) {
            inputErrorHandler(e, deps);
        }
    }, timeout);

    return timeoutId;
}
