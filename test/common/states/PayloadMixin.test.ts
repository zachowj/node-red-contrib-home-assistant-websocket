import { expect } from 'chai';

import PayloadMixin from '../../../src/common/states/PayloadMixin';
import State from '../../../src/common/states/State';

const StateWithPayload = PayloadMixin(State);

describe('Payload Mixin', function () {
    describe('constructor', function () {
        it('should set the initial state', function () {
            const state = new StateWithPayload();
            expect(state.isEnabled()).to.be.true;
        });
        it('should return payload as undefined', function () {
            const state = new StateWithPayload();
            expect(state.getLastPayload()).to.be.undefined;
        });
    });
    describe('setLastPayload', function () {
        it('should set the last payload', function () {
            const state = new StateWithPayload();
            state.setLastPayload({
                one: 123,
            });
            expect(state.getLastPayload()).to.deep.equal({
                one: 123,
            });
        });
    });
});
