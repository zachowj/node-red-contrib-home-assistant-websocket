import { describe, expect, it } from 'vitest';

import { isBoolean, isRecord, isString } from '../../../src/helpers/assert';

describe('assert.ts', () => {
    describe('isBoolean', () => {
        it('should return true for boolean values', () => {
            expect(isBoolean(true)).toBe(true);
            expect(isBoolean(false)).toBe(true);
        });

        it('should return false for non-boolean values', () => {
            expect(isBoolean('true')).toBe(false);
            expect(isBoolean(1)).toBe(false);
            expect(isBoolean(null)).toBe(false);
            expect(isBoolean(undefined)).toBe(false);
            expect(isBoolean({})).toBe(false);
        });
    });

    describe('isString', () => {
        it('should return true for string values', () => {
            expect(isString('hello')).toBe(true);
            expect(isString('')).toBe(true);
        });

        it('should return false for non-string values', () => {
            expect(isString(123)).toBe(false);
            expect(isString(true)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString({})).toBe(false);
        });
    });

    describe('isRecord', () => {
        it('should return true for plain objects', () => {
            expect(isRecord({})).toBe(true);
            expect(isRecord({ key: 'value' })).toBe(true);
        });

        it('should return false for non-plain objects', () => {
            expect(isRecord([])).toBe(false);
            expect(isRecord(null)).toBe(false);
            expect(isRecord(undefined)).toBe(false);
            expect(isRecord('string')).toBe(false);
            expect(isRecord(123)).toBe(false);
            expect(isRecord(true)).toBe(false);
        });
    });
});
