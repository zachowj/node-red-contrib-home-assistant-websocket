import { expect } from 'chai';

import State from '../../../src/common/states/State';

describe('Node State Class', function () {
    describe('constructor', function () {
        it('should set the initial state', function () {
            const state = new State();
            expect(state.isEnabled()).to.be.true;
        });
        it('should return payload as undefined', function () {
            const state = new State();
            expect(state.getLastPayload()).to.be.undefined;
        });
    });
    describe('setEnabled', function () {
        it('should set the node state to false', function () {
            const state = new State();
            state.setEnabled(false);
            expect(state.isEnabled()).to.be.false;
        });
        it('should set the node state to true', function () {
            const state = new State();
            state.setEnabled(true);
            expect(state.isEnabled()).to.be.true;
        });
    });
    describe('isEnabled', function () {
        it('should return the node is disabled', function () {
            const state = new State();
            state.setEnabled(false);
            expect(state.isEnabled()).to.be.false;
        });
        it('should return that the node is enabled', function () {
            const state = new State();
            state.setEnabled(true);
            expect(state.isEnabled()).to.be.true;
        });
    });
    describe('setLastPayload', function () {
        it('should set the last payload', function () {
            const state = new State();
            state.setLastPayload({
                state: 'foo',
                attributes: {
                    foo: 'bar',
                },
            });
            expect(state.getLastPayload()).to.deep.equal({
                state: 'foo',
                attributes: {
                    foo: 'bar',
                },
            });
        });
    });
});
