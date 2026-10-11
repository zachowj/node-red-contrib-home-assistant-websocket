import nock from 'nock';
import { NodeAPI } from 'node-red';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { setRED } from '../../../src/globals';
import { createCredentials, SUPERVISOR_URL } from '../../../src/homeAssistant';
import HttpAPI from '../../../src/homeAssistant/Http';
import { ServerNodeConfig } from '../../../src/types/nodes';

const config = { addon: false } as ServerNodeConfig;

describe('createCredentials', function () {
    beforeAll(function () {
        setRED({ _: (key: string) => key } as unknown as NodeAPI);
    });

    afterEach(function () {
        vi.unstubAllEnvs();
    });

    it('should keep a base URL without a trailing slash', function () {
        const creds = createCredentials(
            { host: 'http://localhost:8123', access_token: '123' },
            config,
        );

        expect(creds.host).toBe('http://localhost:8123');
    });

    // Paths are appended to the host, so a trailing slash would request
    // `//api/websocket`, which Home Assistant answers with a 404
    it('should strip a trailing slash from the base URL', function () {
        const creds = createCredentials(
            { host: 'http://localhost:8123/', access_token: '123' },
            config,
        );

        expect(creds.host).toBe('http://localhost:8123');
    });

    it('should strip whitespace and trailing slashes from the base URL', function () {
        const creds = createCredentials(
            { host: ' https://example.com:8123// ', access_token: '123' },
            config,
        );

        expect(creds.host).toBe('https://example.com:8123');
    });

    it('should keep a path prefix in the base URL', function () {
        const creds = createCredentials(
            { host: 'https://example.com/homeassistant/', access_token: '123' },
            config,
        );

        expect(creds.host).toBe('https://example.com/homeassistant');
    });

    it('should use the supervisor token when the add-on option is enabled', function () {
        vi.stubEnv('SUPERVISOR_TOKEN', 'supervisor-token');

        const creds = createCredentials({ host: '', access_token: '' }, {
            addon: true,
        } as ServerNodeConfig);

        expect(creds).toEqual({
            host: SUPERVISOR_URL,
            access_token: 'supervisor-token',
        });
    });

    it('should detect an add-on base URL with a trailing slash', function () {
        vi.stubEnv('SUPERVISOR_TOKEN', 'supervisor-token');

        const creds = createCredentials(
            { host: `${SUPERVISOR_URL}/`, access_token: '123' },
            config,
        );

        expect(creds).toEqual({
            host: SUPERVISOR_URL,
            access_token: 'supervisor-token',
        });
    });

    it('should throw an error when the base URL is empty', function () {
        expect(() =>
            createCredentials({ host: '/', access_token: '123' }, config),
        ).toThrow('config-server.errors.empty_base_url');
    });

    it('should throw an error when the base URL is invalid', function () {
        expect(() =>
            createCredentials(
                { host: 'not a url/', access_token: '123' },
                config,
            ),
        ).toThrow('config-server.errors.invalid_base_url');
    });

    it('should throw an error when the protocol is not http(s)', function () {
        expect(() =>
            createCredentials(
                { host: 'ws://localhost:8123/', access_token: '123' },
                config,
            ),
        ).toThrow('config-server.errors.invalid_protocol');
    });

    it('should request paths with a single slash when the host has a trailing slash', async function () {
        const creds = createCredentials(
            { host: 'http://homeassistant:8123/', access_token: '123' },
            config,
        );
        const httpAPI = new HttpAPI({
            ...creds,
            rejectUnauthorizedCerts: false,
        });

        const scope = nock('http://homeassistant:8123')
            .get('/api/config')
            .reply(200, 'request successful');
        const response = await httpAPI.get('/config');

        expect(response).toEqual('request successful');
        expect(scope.isDone()).toBe(true);
    });
});
