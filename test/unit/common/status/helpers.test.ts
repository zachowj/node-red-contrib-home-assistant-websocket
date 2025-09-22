import { describe, expect, it } from 'vitest';

import { getStatusOptions } from '../../../../src/common/status/helpers';

describe('getStatusOptions', function () {
    describe('Return the correct year value', function () {
        it('should return undefined if the year is hidden', function () {
            const options = getStatusOptions({
                statusYear: 'hidden',
            });

            expect(options.year).toEqual(undefined);
        });

        it('should return "numeric" year if the year is set to numeric', function () {
            const options = getStatusOptions({
                statusYear: 'numeric',
            });

            expect(options.year).toEqual('numeric');
        });

        it('should return "2-digit" year if the year is set to 2-digit', function () {
            const options = getStatusOptions({
                statusYear: '2-digit',
            });

            expect(options.year).toEqual('2-digit');
        });
    });

    describe('Return the correct month value', function () {
        it('should return undefined if the month is hidden', function () {
            const options = getStatusOptions({
                statusMonth: 'hidden',
            });

            expect(options.month).toEqual(undefined);
        });

        it('should return "numeric" month if the month is set to numeric', function () {
            const options = getStatusOptions({
                statusMonth: 'numeric',
            });

            expect(options.month).toEqual('numeric');
        });

        it('should return "2-digit" month if the month is set to 2-digit', function () {
            const options = getStatusOptions({
                statusMonth: '2-digit',
            });

            expect(options.month).toEqual('2-digit');
        });

        it('should return "short" month if the month is set to short', function () {
            const options = getStatusOptions({
                statusMonth: 'short',
            });

            expect(options.month).toEqual('short');
        });

        it('should return "long" month if the month is set to long', function () {
            const options = getStatusOptions({
                statusMonth: 'long',
            });

            expect(options.month).toEqual('long');
        });
    });

    describe('Return the correct day value', function () {
        it('should return undefined if the day is hidden', function () {
            const options = getStatusOptions({
                statusDay: 'hidden',
            });

            expect(options.day).toEqual(undefined);
        });

        it('should return "numeric" day if the day is set to numeric', function () {
            const options = getStatusOptions({
                statusDay: 'numeric',
            });

            expect(options.day).toEqual('numeric');
        });

        it('should return "2-digit" day if the day is set to 2-digit', function () {
            const options = getStatusOptions({
                statusDay: '2-digit',
            });

            expect(options.day).toEqual('2-digit');
        });
    });

    describe('Return the correct hourCycle value', function () {
        it('should return undefined if the hourCycle is default', function () {
            const options = getStatusOptions({
                statusHourCycle: 'default',
            });

            expect(options.hourCycle).toEqual(undefined);
        });

        it('should return "h12" hourCycle if the hourCycle is set to h12', function () {
            const options = getStatusOptions({
                statusHourCycle: 'h12',
            });

            expect(options.hourCycle).toEqual('h12');
        });

        it('should return "h23" hourCycle if the hourCycle is set to h23', function () {
            const options = getStatusOptions({
                statusHourCycle: 'h23',
            });

            expect(options.hourCycle).toEqual('h23');
        });
    });

    describe('Return the correct time format value', function () {
        it('should return hour:minute:seconds if the time format is h:m"s', function () {
            const options = getStatusOptions({
                statusTimeFormat: 'h:m:s',
            });

            expect(options.second).toEqual('numeric');
        });

        it('should return hour:minute:seconds.milliseconds if the time format is h:m"s.ms', function () {
            const options = getStatusOptions({
                statusTimeFormat: 'h:m:s.ms',
            });

            expect(options.second).toEqual('numeric');
            expect(options.fractionalSecondDigits).toEqual(3);
        });
    });
});
