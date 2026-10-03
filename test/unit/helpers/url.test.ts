import { describe, expect, it } from 'vitest';

import { normalizeBaseUrl } from '../../../src/helpers/url';

describe('url', function () {
    describe('normalizeBaseUrl', function () {
        it('should leave a valid base URL untouched', function () {
            expect(normalizeBaseUrl('http://localhost:8123')).toBe(
                'http://localhost:8123',
            );
        });

        it('should remove a trailing slash', function () {
            expect(normalizeBaseUrl('http://localhost:8123/')).toBe(
                'http://localhost:8123',
            );
        });

        it('should remove multiple trailing slashes', function () {
            expect(normalizeBaseUrl('http://localhost:8123///')).toBe(
                'http://localhost:8123',
            );
        });

        it('should remove surrounding whitespace', function () {
            expect(normalizeBaseUrl('  http://localhost:8123/  ')).toBe(
                'http://localhost:8123',
            );
        });

        it('should keep a path prefix', function () {
            expect(normalizeBaseUrl('https://example.com/homeassistant/')).toBe(
                'https://example.com/homeassistant',
            );
        });

        it('should not alter a Node-RED environment variable', function () {
            // eslint-disable-next-line no-template-curly-in-string
            expect(normalizeBaseUrl('${HA_URL}')).toBe(
                // eslint-disable-next-line no-template-curly-in-string
                '${HA_URL}',
            );
        });

        it('should return an empty string for an empty value', function () {
            expect(normalizeBaseUrl('')).toBe('');
            expect(normalizeBaseUrl(undefined)).toBe('');
        });
    });
});
