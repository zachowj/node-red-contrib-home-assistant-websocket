export interface RetryOptions {
    retries: number; // max retries (not including the initial try)
    baseMs: number; // initial delay
    maxMs: number; // max delay cap
    factor?: number; // backoff factor (default 2)
    isRetriable?: (err: any) => boolean;
    beforeRetry?: (attempt: number, delayMs: number, err: any) => void;
    onGiveUp?: (err: any) => void;
}

/**
 * Determines if an error is considered retriable by default.
 *
 * This function checks the error object for specific network-related error codes
 * or HTTP status codes that indicate a temporary issue, such as connection
 * problems or server unavailability.
 *
 * @param err - The error object to evaluate. It may contain properties such as
 * `code` (for network errors) or `response.status` (for HTTP status codes).
 *
 * @returns `true` if the error is deemed retriable, `false` otherwise.
 *
 * Retriable conditions:
 * - Network error codes: `ECONNREFUSED`, `ETIMEDOUT`, `ECONNRESET`, `ENETUNREACH`, `EAI_AGAIN`.
 * - HTTP status codes: `429` (Too Many Requests), `500` (Internal Server Error),
 *   `502` (Bad Gateway), `503` (Service Unavailable), `504` (Gateway Timeout).
 */
export function isDefaultRetriable(err: any): boolean {
    const code = err?.code as string | undefined;
    if (
        code === 'ECONNREFUSED' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNRESET' ||
        code === 'ENETUNREACH' ||
        code === 'EAI_AGAIN'
    ) {
        return true;
    }
    const status = err?.response?.status as number | undefined;
    if (status && [429, 500, 502, 503, 504].includes(status)) return true;
    return false;
}

/**
 * Retries a given asynchronous function with exponential backoff.
 *
 * @template T The type of the value returned by the function.
 * @param fn The asynchronous function to be retried. It should return a promise.
 * @param opts Configuration options for the retry mechanism.
 * @param opts.baseMs The initial delay in milliseconds before the first retry.
 * @param opts.factor The multiplier for the delay between retries (default is 2).
 * @param opts.maxMs The maximum delay in milliseconds between retries.
 * @param opts.retries The maximum number of retry attempts.
 * @param opts.isRetriable Optional function to determine if an error is retriable.
 *        If not provided, a default retriable check will be used.
 * @param opts.beforeRetry Optional callback invoked before each retry attempt.
 *        Receives the current attempt number, the delay before the next attempt, and the error.
 * @param opts.onGiveUp Optional callback invoked when retries are exhausted or the error is non-retriable.
 *        Receives the error that caused the failure.
 * @returns A promise that resolves with the result of the function or rejects with the last error.
 * @throws The last error encountered if the retries are exhausted or the error is non-retriable.
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    opts: RetryOptions,
): Promise<T> {
    const factor = opts.factor ?? 2;
    let attempt = 0;
    let delay = opts.baseMs;

    // attempt counts retries; total tries = retries + 1
    while (true) {
        try {
            return await fn();
        } catch (err) {
            const retriable = opts.isRetriable
                ? opts.isRetriable(err)
                : isDefaultRetriable(err);
            const isLast = attempt >= opts.retries;

            if (!retriable || isLast) {
                // Guard onGiveUp to avoid throwing from user callback
                try {
                    opts.onGiveUp?.(err);
                } catch {
                    // swallow callback error to preserve original rejection
                }
                throw err;
            }

            const wait = Math.min(delay, opts.maxMs);

            // Guard beforeRetry to avoid unhandled exceptions
            try {
                opts.beforeRetry?.(attempt, wait, err);
            } catch {
                // swallow callback error, proceed with retry
            }

            await new Promise((resolve) => setTimeout(resolve, wait));
            delay = Math.min(delay * factor, opts.maxMs);
            attempt += 1;
        }
    }
}
