import { expect } from 'chai';

import { formatDate } from '../../src/helpers/date';

describe('formatDate', function () {
    let nodeVersion: string;
    before(function () {
        nodeVersion = process.version.substring(1, 3);
    });

    it('should format date', function () {
        const date = new Date(2012, 0, 12, 12, 12, 12);
        const formattedDate = formatDate({
            locale: 'en-US',
            date,
        });
        expect(formattedDate).to.equal('Jan 12, 12:12 PM');
    });
    it('should format date using en-GB as locale', function () {
        // node 12 does not support en-GB locale
        if (nodeVersion === '12') this.skip();
        const date = new Date(2012, 0, 12, 16, 12, 12);
        const formattedDate = formatDate({
            locale: 'en-GB',
            date,
        });
        expect(formattedDate).to.equal('12 Jan, 16:12');
    });
    it('should format date to include all options', function () {
        // node 12 does not support Intl.DateTimeFormatOptions fractionalSecondDigits
        if (nodeVersion === '12') this.skip();
        const date = new Date(2012, 0, 12, 12, 12, 12, 123);
        const formattedDate = formatDate({
            locale: 'en-US',
            date,
            options: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 3,
            },
        });
        expect(formattedDate).to.equal('01/12/2012, 12:12:12.123 PM');
    });

    it('should fallback to en-US locale', function () {
        const date = new Date(2012, 0, 12, 12, 12, 12);
        const formattedDate = formatDate({
            locale: undefined,
            date,
        });
        expect(formattedDate).to.equal('Jan 12, 12:12 PM');
    });
});
