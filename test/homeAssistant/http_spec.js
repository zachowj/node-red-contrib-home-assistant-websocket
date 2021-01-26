'use strict';
const expect = require('chai').expect;
const nock = require('nock');

const HttpAPI = require('../../lib/HomeAssistant/Http');

describe('HTTP API', function () {
    const CREDS = {
        apiPass: '123',
        baseUrl: 'http://homeassistant',
    };

    describe('instantiation', function () {
        it('should initialize correctly', function () {
            const api = new HttpAPI(CREDS);

            expect(CREDS).to.equal(api.config);
            expect(api.client.defaults.headers.Authorization).to.equal(
                `Bearer ${CREDS.apiPass}`
            );
            expect(api.client.defaults.baseURL).to.equal(
                `${CREDS.baseUrl}/api`
            );
        });

        it('should initialize correctly as legacy', function () {
            const config = {
                baseUrl: 'http://homeassistant',
                legacy: true,
                apiPass: '123abc',
            };
            const api = new HttpAPI(config);

            expect(config).to.equal(api.config);
            expect(api.client.defaults.headers['x-ha-access']).to.equal(
                config.apiPass
            );
            expect(api.client.defaults.baseURL).to.equal(
                `${config.baseUrl}/api`
            );
        });
    });

    describe('get', function () {
        it('should use the correct authentication header', async function () {
            const path = '/config';
            const httpApi = new HttpAPI(CREDS);

            nock(CREDS.baseUrl)
                .matchHeader('authorization', `Bearer ${CREDS.apiPass}`)
                .get(`/api${path}`)
                .reply(200, true);
            const response = await httpApi.get(path);

            expect(response).to.be.true;
        });
        it('should use the correct authentication header when legacy is true', async function () {
            const config = {
                apiPass: '123',
                baseUrl: 'http://homeassistant.local',
                legacy: true,
            };
            const path = '/config';
            const httpApi = new HttpAPI(config);

            nock(config.baseUrl)
                .matchHeader('x-ha-access', config.apiPass)
                .get(`/api${path}`)
                .reply(200, true);
            const response = await httpApi.get(path);

            expect(response).to.be.true;
        });
    });
    describe('fireEvent', function () {
        it('should post to the correct endpoint', async function () {
            const event = 'test';
            const httpApi = new HttpAPI(CREDS);

            nock(CREDS.baseUrl).post(`/api/events/${event}`).reply(200, true);
            const response = await httpApi.fireEvent(event);

            expect(response).to.be.true;
        });
        it('should post to correct endpoint with event data', async function () {
            const event = 'test';
            const eventData = { abc: 1234 };
            const httpApi = new HttpAPI(CREDS);

            nock(CREDS.baseUrl)
                .post(`/api/events/${event}`, JSON.stringify(eventData))
                .reply(200, true);
            const response = await httpApi.fireEvent(event, eventData);

            expect(response).to.be.true;
        });
    });

    describe('get-history', function () {
        it('should use the correct endpoint with no data', async function () {
            const httpApi = new HttpAPI(CREDS);

            nock(CREDS.baseUrl).get('/api/history/period').reply(200, true);
            const response = await httpApi.getHistory();

            expect(response).to.be.true;
        });

        it('should use the correct endpoint with an entity and timestamp', async function () {
            const data = {
                filterEntityId: 'sun.sun',
                timestamp: '2020-01-01:12:12:12',
            };
            const httpApi = new HttpAPI(CREDS);

            nock(CREDS.baseUrl)
                .get(
                    `/api/history/period/${data.timestamp}?filter_entity_id=${data.filterEntityId}`
                )
                .reply(200, true);
            const response = await httpApi.getHistory(
                data.timestamp,
                data.filterEntityId
            );

            expect(response).to.be.true;
        });

        it('should use the correct endpoint with endTimestamp', async function () {
            const data = {
                endTimestamp: '2020-01-01:12:12:12',
            };
            const httpApi = new HttpAPI(CREDS);

            nock(CREDS.baseUrl)
                .get(`/api/history/period?end_time=${data.endTimestamp}`)
                .reply(200, true);
            const response = await httpApi.getHistory(
                null,
                null,
                data.endTimestamp
            );

            expect(response).to.be.true;
        });

        it('should return a sorted flatten array', async function () {
            const createEntity = (num) => {
                return {
                    last_updated: num,
                };
            };
            const arr = [
                [createEntity(2), createEntity(1)],
                [createEntity(5), createEntity(3), createEntity(4)],
            ];
            const expectedResponse = [
                createEntity(1),
                createEntity(2),
                createEntity(3),
                createEntity(4),
                createEntity(5),
            ];
            const httpApi = new HttpAPI(CREDS);

            nock(CREDS.baseUrl).get('/api/history/period').reply(200, arr);
            const response = await httpApi.getHistory(null, null, null, {
                flatten: true,
            });

            expect(response).to.eql(expectedResponse);
        });
    });

    describe('renderTemplate', function () {
        it('should return a string', async function () {
            const str = 'Hello!';
            const httpApi = new HttpAPI(CREDS);

            nock(CREDS.baseUrl)
                .post(`/api/template`, { template: str })
                .reply(200, str);
            const response = await httpApi.renderTemplate(str);

            expect(response).to.equal(str);
        });
    });
});
