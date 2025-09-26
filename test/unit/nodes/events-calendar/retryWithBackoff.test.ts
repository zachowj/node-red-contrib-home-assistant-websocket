// src/nodes/events-calendar/retryWithBackoff.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    isDefaultRetriable,
    retryWithBackoff,
} from '../../../../src/nodes/events-calendar/retryWithBackoff';

describe('retryWithBackoff', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should resolve without retries on success', async () => {
        vi.useFakeTimers();
        const fn = vi.fn<() => Promise<string>>().mockResolvedValue('ok');
        const beforeRetry = vi.fn();
        const onGiveUp = vi.fn();

        const result = await retryWithBackoff(fn, {
            retries: 3,
            baseMs: 100,
            maxMs: 1000,
            beforeRetry,
            onGiveUp,
        });

        expect(result).toBe('ok');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(beforeRetry).not.toHaveBeenCalled();
        expect(onGiveUp).not.toHaveBeenCalled();
    });

    it('should retry on retriable errors and succeed eventually', async () => {
        vi.useFakeTimers();
        const err1 = { code: 'ETIMEDOUT' };
        const err2 = { code: 'ECONNRESET' };
        const fn = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(err1)
            .mockRejectedValueOnce(err2)
            .mockResolvedValueOnce('done');

        const beforeRetry =
            vi.fn<(attempt: number, delayMs: number, err: any) => void>();
        const onGiveUp = vi.fn();

        const p = retryWithBackoff(fn, {
            retries: 3,
            baseMs: 100,
            maxMs: 1000,
            factor: 2,
            beforeRetry,
            onGiveUp,
        });

        // 1st retry wait
        await vi.advanceTimersByTimeAsync(100);
        // 2nd retry wait
        await vi.advanceTimersByTimeAsync(200);

        const result = await p;

        expect(result).toBe('done');
        expect(fn).toHaveBeenCalledTimes(3);
        expect(beforeRetry).toHaveBeenCalledTimes(2);
        expect(beforeRetry).toHaveBeenNthCalledWith(1, 0, 100, err1);
        expect(beforeRetry).toHaveBeenNthCalledWith(2, 1, 200, err2);
        expect(onGiveUp).not.toHaveBeenCalled();
    });

    it('should cap delay at maxMs', async () => {
        vi.useFakeTimers();
        const err1 = { code: 'ECONNREFUSED' };
        const err2 = { code: 'ETIMEDOUT' };
        const fn = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(err1)
            .mockRejectedValueOnce(err2)
            .mockResolvedValueOnce('ok');

        const beforeRetry =
            vi.fn<(attempt: number, delayMs: number, err: any) => void>();

        const p = retryWithBackoff(fn, {
            retries: 2,
            baseMs: 400,
            maxMs: 500,
            factor: 3,
            beforeRetry,
        });

        // waits: min(400, 500) = 400, then delay=min(1200, 500)=500 -> wait 500
        await vi.advanceTimersByTimeAsync(400);
        await vi.advanceTimersByTimeAsync(500);

        const result = await p;

        expect(result).toBe('ok');
        expect(beforeRetry).toHaveBeenCalledTimes(2);
        expect(beforeRetry).toHaveBeenNthCalledWith(1, 0, 400, err1);
        expect(beforeRetry).toHaveBeenNthCalledWith(2, 1, 500, err2);
    });

    it('should not retry for non-retriable error and call onGiveUp', async () => {
        vi.useFakeTimers();
        const error = { response: { status: 400 } }; // not retriable by default
        const fn = vi.fn<() => Promise<string>>().mockRejectedValue(error);
        const beforeRetry = vi.fn();
        const onGiveUp = vi.fn();

        await expect(
            retryWithBackoff(fn, {
                retries: 5,
                baseMs: 50,
                maxMs: 1000,
                beforeRetry,
                onGiveUp,
            }),
        ).rejects.toEqual(error);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(beforeRetry).not.toHaveBeenCalled();
        expect(onGiveUp).toHaveBeenCalledTimes(1);
        expect(onGiveUp).toHaveBeenCalledWith(error);
    });

    it('should honor custom isRetriable predicate', async () => {
        vi.useFakeTimers();
        const e1 = { custom: true };
        const e2 = { custom: false };
        const fn = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(e1)
            .mockRejectedValueOnce(e2);

        const beforeRetry = vi.fn();
        const onGiveUp = vi.fn();
        const isRetriable = (err: any) => err?.custom === true;

        const p = retryWithBackoff(fn, {
            retries: 3,
            baseMs: 100,
            maxMs: 1000,
            isRetriable,
            beforeRetry,
            onGiveUp,
        });

        // Attach a handler immediately to avoid unhandled rejection
        const handled = p.catch((e) => e);

        // Only first error is retriable; we expect one retry, then give up
        await vi.advanceTimersByTimeAsync(100);

        // Assert on the handled promise
        await expect(handled).resolves.toEqual(e2);

        expect(beforeRetry).toHaveBeenCalledTimes(1);
        expect(beforeRetry).toHaveBeenCalledWith(0, 100, e1);
        expect(onGiveUp).toHaveBeenCalledTimes(1);
        expect(onGiveUp).toHaveBeenCalledWith(e2);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should continue retrying even if beforeRetry throws', async () => {
        vi.useFakeTimers();
        const err1 = { code: 'ETIMEDOUT' };
        const fn = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(err1)
            .mockResolvedValueOnce('ok');

        const beforeRetry = vi.fn(() => {
            throw new Error('beforeRetry boom');
        });
        const onGiveUp = vi.fn();

        const p = retryWithBackoff(fn, {
            retries: 2,
            baseMs: 100,
            maxMs: 1000,
            beforeRetry,
            onGiveUp,
        });

        // Wait for the single retry (100ms)
        await vi.advanceTimersByTimeAsync(100);

        const result = await p;
        expect(result).toBe('ok');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(beforeRetry).toHaveBeenCalledTimes(1);
        expect(onGiveUp).not.toHaveBeenCalled();
    });

    it('should reject with original error even if onGiveUp throws (non-retriable)', async () => {
        vi.useFakeTimers();
        const error = { response: { status: 400 } }; // non-retriable by default
        const fn = vi.fn<() => Promise<string>>().mockRejectedValue(error);
        const beforeRetry = vi.fn();
        const onGiveUp = vi.fn(() => {
            throw new Error('onGiveUp boom');
        });

        const p = retryWithBackoff(fn, {
            retries: 3,
            baseMs: 100,
            maxMs: 1000,
            beforeRetry,
            onGiveUp,
        });

        // Pre-handle rejection to avoid unhandled warnings
        const handled = p.catch((e) => e);
        await expect(handled).resolves.toBe(error);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(beforeRetry).not.toHaveBeenCalled();
        expect(onGiveUp).toHaveBeenCalledTimes(1);
        expect(onGiveUp).toHaveBeenCalledWith(error);
    });

    it('should not retry when retries=0 even for retriable errors', async () => {
        vi.useFakeTimers();
        const error = { code: 'ETIMEDOUT' }; // retriable by default
        const fn = vi.fn<() => Promise<string>>().mockRejectedValue(error);
        const beforeRetry = vi.fn();
        const onGiveUp = vi.fn();

        const p = retryWithBackoff(fn, {
            retries: 0,
            baseMs: 100,
            maxMs: 1000,
            beforeRetry,
            onGiveUp,
        });

        const handled = p.catch((e) => e);
        await expect(handled).resolves.toBe(error);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(beforeRetry).not.toHaveBeenCalled();
        expect(onGiveUp).toHaveBeenCalledTimes(1);
        expect(onGiveUp).toHaveBeenCalledWith(error);
    });
});

describe('isDefaultRetriable', () => {
    it('should return true for known network error codes', () => {
        expect(isDefaultRetriable({ code: 'ECONNREFUSED' })).toBe(true);
        expect(isDefaultRetriable({ code: 'ETIMEDOUT' })).toBe(true);
        expect(isDefaultRetriable({ code: 'ECONNRESET' })).toBe(true);
        expect(isDefaultRetriable({ code: 'ENETUNREACH' })).toBe(true);
        expect(isDefaultRetriable({ code: 'EAI_AGAIN' })).toBe(true);
    });

    it('should return true for HTTP 429/5xx statuses', () => {
        [429, 500, 502, 503, 504].forEach((status) => {
            expect(isDefaultRetriable({ response: { status } })).toBe(true);
        });
    });

    it('should return false for other errors/statuses', () => {
        expect(isDefaultRetriable({ code: 'SOME_OTHER' })).toBe(false);
        expect(isDefaultRetriable({ response: { status: 400 } })).toBe(false);
        expect(isDefaultRetriable({})).toBe(false);
        expect(isDefaultRetriable(null)).toBe(false);
        expect(isDefaultRetriable(undefined)).toBe(false);
    });
});
