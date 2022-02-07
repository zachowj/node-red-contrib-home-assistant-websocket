const expect = require('chai').expect;
const nock = require('nock');

const HttpAPI = require('../../src/homeAssistant/Http').default;

describe('HTTP API', function () {
    const CREDS = {
        access_token: '123',
        host: 'http://homeassistant',
    };
    let httpApi = null;
    before(function () {
        httpApi = new HttpAPI(CREDS);
    });
    describe('get', function () {
        it('should use the correct authentication header', async function () {
            const path = '/config';

            nock(CREDS.host)
                .matchHeader('authorization', `Bearer ${CREDS.access_token}`)
                .get(`/api${path}`)
                .reply(200, true);
            const response = await httpApi.get(path);

            expect(response).to.be.true;
        });
    });
    describe('fireEvent', function () {
        it('should post to the correct endpoint', async function () {
            const event = 'test';

            nock(CREDS.host).post(`/api/events/${event}`).reply(200, true);
            const response = await httpApi.fireEvent(event);

            expect(response).to.be.true;
        });
        it('should post to correct endpoint with event data', async function () {
            const event = 'test';
            const eventData = { abc: 1234 };

            nock(CREDS.host)
                .post(`/api/events/${event}`, JSON.stringify(eventData))
                .reply(200, true);
            const response = await httpApi.fireEvent(event, eventData);

            expect(response).to.be.true;
        });
    });

    describe('get-history', function () {
        it('should use the correct endpoint with no data', async function () {
            nock(CREDS.host).get('/api/history/period').reply(200, true);
            const response = await httpApi.getHistory();

            expect(response).to.be.true;
        });

        it('should use the correct endpoint with an entity and timestamp', async function () {
            const data = {
                filterEntityId: 'sun.sun',
                timestamp: '2020-01-01:12:12:12',
            };

            nock(CREDS.host)
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

            nock(CREDS.host)
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

            nock(CREDS.host).get('/api/history/period').reply(200, arr);
            const response = await httpApi.getHistory(null, null, null, {
                flatten: true,
            });

            expect(response).to.eql(expectedResponse);
        });
    });

    describe('renderTemplate', function () {
        it('should return a string', async function () {
            const str = 'Hello!';

            nock(CREDS.host)
                .post(`/api/template`, { template: str })
                .reply(200, str);
            const response = await httpApi.renderTemplate(str);

            expect(response).to.equal(str);
        });
    });
});
