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
    run(properties: OutputProperty[]) {
        return this.setCustomOutputs(properties, {}, {});
    }
}

function setup(value: unknown) {
    const contextService = mock<NodeRedContextService>();
    const typedInputService = mock<TypedInputService>();
    typedInputService.getValue.mockResolvedValue(value);

    const controller = new TestController({
        homeAssistant: mock<HomeAssistant>(),
        jsonataService: mock<JSONataService>(),
        nodeRedContextService: contextService,
        node: mock<BaseNode>(),
        status: mock<Status>(),
        typedInputService,
    } as OutputControllerConstructor<BaseNode>);

    return { controller, contextService };
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
