import { isError as isJoiError } from 'joi';

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

export function getErrorData(e: unknown) {
    let statusMessage = RED._('home-assistant.status.error');
    if (isJoiError(e)) {
        statusMessage = RED._('home-assistant.status.validation_error');
    } else if (isHomeAssistantApiError(e)) {
        e = new HomeAssistantError(e);
    } else if (e instanceof BaseError) {
        statusMessage = e.statusMessage;
    } else if (e instanceof Error) {
        statusMessage = e.name || statusMessage;
    } else if (typeof e === 'string') {
        e = new Error(e);
    } else {
        e = new Error(
            RED._('home-assistant.error.unrecognized_error', {
                error: JSON.stringify(e),
            }),
        );
    }

    return { error: e as Error, statusMessage };
}

export function inputErrorHandler(e: unknown, deps?: Dependencies) {
    const { error, statusMessage } = getErrorData(e);

    deps?.status?.setFailed(statusMessage);
    deps?.done?.(error);
}

export function setTimeoutWithErrorHandling(
    callback: (...args: any[]) => void,
    timeout: number,
    deps?: Dependencies,
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
