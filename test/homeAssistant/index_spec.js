const expect = require('chai').expect;

const HomeAssistant = require('../../src/HomeAssistant/HomeAssistant');

describe('HomeAssistant', function () {
    describe('getEntities', function () {
        it('should return a sorted list of entities', function () {
            const states = {
                z: {},
                b: {},
                a: {},
            };
            const expectedResults = Object.keys(states).sort();
            const ha = new HomeAssistant({
                websocketAPI: { getStates: () => states },
                httpAPI: {},
                eventBus: {},
            });

            const results = ha.getEntities();

            expect(results).to.eql(expectedResults);
        });
    });
});
