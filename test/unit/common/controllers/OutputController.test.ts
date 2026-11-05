import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

import OutputController, {
    OutputControllerConstructor,
} from '../../../../src/common/controllers/OutputController';
import JSONataService from '../../../../src/common/services/JSONataService';
import NodeRedContextService from '../../../../src/common/services/NodeRedContextService';
import TypedInputService from '../../../../src/common/services/TypedInputService';
import Status from '../../../../src/common/status/Status';
import { TypedInputTypes } from '../../../../src/const';
import HomeAssistant from '../../../../src/homeAssistant/HomeAssistant';
import { BaseNode, OutputProperty } from '../../../../src/types/nodes';

class TestController extends OutputController {
    run(properties: OutputProperty[], extras: Record<string, unknown> = {}) {
        return this.setCustomOutputs(properties, {}, extras);
    }
}

function setup(value: unknown) {
    const contextService = mock<NodeRedContextService>();
    const typedInputService = mock<TypedInputService>();
    typedInputService.getValue.mockResolvedValue(value);
    const node = mock<BaseNode>();

    const controller = new TestController({
        homeAssistant: mock<HomeAssistant>(),
        jsonataService: mock<JSONataService>(),
        nodeRedContextService: contextService,
        node,
        status: mock<Status>(),
        typedInputService,
    } as OutputControllerConstructor<BaseNode>);

    return { controller, contextService, node };
}

const property = (valueType: TypedInputTypes): OutputProperty =>
    ({
        property: 'data',
        propertyType: 'msg',
        value: '',
        valueType,
    }) as OutputProperty;

describe('OutputController.setCustomOutputs', function () {
    it.each([
        TypedInputTypes.Entity,
        TypedInputTypes.EntityState,
        TypedInputTypes.TimeSinceChangedMs,
        TypedInputTypes.PrevEntity,
        TypedInputTypes.EventData,
        TypedInputTypes.Value,
        TypedInputTypes.TriggerId,
    ])('warns when %s data is not provided', async function (valueType) {
        const { controller, node } = setup(undefined);

        await controller.run([property(valueType)]);

        expect(node.warn).toHaveBeenCalledWith(
            expect.stringContaining('is not available for this node'),
        );
    });

    it('does not warn when the key is present but undefined', async function () {
        const { controller, node } = setup(undefined);

        await controller.run([property(TypedInputTypes.PrevEntity)], {
            prevEntity: undefined,
        });

        expect(node.warn).not.toHaveBeenCalled();
    });

    it('does not warn for types that need no props', async function () {
        const { controller, node } = setup('x');

        await controller.run([property(TypedInputTypes.String)]);

        expect(node.warn).not.toHaveBeenCalled();
    });
    it.each([
        TypedInputTypes.Entity,
        TypedInputTypes.PrevEntity,
        TypedInputTypes.EventData,
        TypedInputTypes.JSONata,
    ])('gives the user a copy for %s', async function (valueType) {
        const shared = { attributes: { list: [1] } };
        const { controller, contextService } = setup(shared);

        await controller.run([property(valueType)]);

        const sent = contextService.set.mock.calls[0][0] as typeof shared;
        expect(sent).toEqual(shared);
        expect(sent).not.toBe(shared);
        expect(sent.attributes.list).not.toBe(shared.attributes.list);
    });

    it('copies JSONata results that structuredClone rejects', async function () {
        const shared = { fn: () => 1 };
        const { controller, contextService } = setup(shared);

        await controller.run([property(TypedInputTypes.JSONata)]);

        const sent = contextService.set.mock.calls[0][0] as typeof shared;
        expect(sent).not.toBe(shared);
        expect(sent.fn()).toBe(1);
    });

    it('does not copy values that cannot reference websocket data', async function () {
        const shared = { a: 1 };
        const { controller, contextService } = setup(shared);

        await controller.run([property(TypedInputTypes.Message)]);

        expect(contextService.set.mock.calls[0][0]).toBe(shared);
    });
});
