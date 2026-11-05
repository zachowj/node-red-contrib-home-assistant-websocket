import { expect, vi } from 'vitest';

import { TAGS_ALL, TypedInputTypes } from '../../../src/const';
import ButtonController from '../../../src/nodes/button/ButtonController';
import DeviceTriggerController from '../../../src/nodes/device/DeviceTriggerController';
import NumberOutputController from '../../../src/nodes/number/NumberOutputController';
import SelectOutputController from '../../../src/nodes/select/SelectOutputController';
import SentenceOutputController from '../../../src/nodes/sentence/SentenceOutputController';
import TagController from '../../../src/nodes/tag/TagController';
import TextOutputController from '../../../src/nodes/text/TextOutputController';
import TimeEntityOutputController from '../../../src/nodes/time-entity/TimeEntityOutputController';
import WebhookController from '../../../src/nodes/webhook/WebhookController';
import {
    createOutputControllerDeps,
    describeOutputProperties,
    entityStateCases,
    FakeOutputNode,
    OutputCase,
} from '../../helpers/outputPropertiesHarness';

const T = TypedInputTypes;

const sentMessage = (node: FakeOutputNode) => node.send.mock.calls[0]?.[0];

const valueCases = (value: unknown, previous: unknown): OutputCase[] => [
    { name: 'value', valueType: T.Value, expected: value },
    { name: 'previousValue', valueType: T.PreviousValue, expected: previous },
];

describeOutputProperties({
    title: 'Button',
    specific: [
        {
            name: 'entity',
            valueType: T.Entity,
            expected: expect.objectContaining({ entity_id: 'button.test' }),
        },
        { name: 'triggerId', valueType: T.TriggerId, expected: 'button.test' },
        {
            name: 'timeSinceChangedMs',
            valueType: T.TimeSinceChangedMs,
            expected: expect.any(Number),
        },
        ...entityStateCases('on'),
    ],
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const controller = new ButtonController(
            createOutputControllerDeps(node),
        );
        await controller.onTrigger({
            entity: {
                entity_id: 'button.test',
                state: 'on',
                attributes: {},
                last_changed: new Date(Date.now() - 1000).toISOString(),
            },
        } as any);
        return sentMessage(node);
    },
});

describeOutputProperties({
    title: 'Webhook',
    specific: [
        { name: 'data', valueType: T.Data, expected: { body: 1 } },
        { name: 'headers', valueType: T.Headers, expected: { h: 'v' } },
        { name: 'params', valueType: T.Params, expected: { p: 'v' } },
    ],
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const controller = new WebhookController(
            createOutputControllerDeps(node),
        );
        await controller.onReceivedMessage({
            payload: { body: 1 },
            headers: { h: 'v' },
            params: { p: 'v' },
        });
        return sentMessage(node);
    },
});

describeOutputProperties({
    title: 'Device trigger',
    config: { device: 'device_1' },
    specific: [
        {
            name: 'eventData',
            valueType: T.EventData,
            expected: { description: 'pressed' },
        },
        { name: 'triggerId', valueType: T.TriggerId, expected: 'device_1' },
    ],
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const controller = new DeviceTriggerController(
            createOutputControllerDeps(node),
        );
        await controller.onTrigger({ description: 'pressed' });
        return sentMessage(node);
    },
});

describeOutputProperties({
    title: 'Tag',
    config: { tags: [TAGS_ALL], devices: [] },
    specific: [
        {
            name: 'eventData',
            valueType: T.EventData,
            expected: {
                tag_name: 'My tag',
                user_id: 'user_1',
                device_id: 'device_1',
                tag_id: 'tag_1',
            },
        },
        { name: 'triggerId', valueType: T.TriggerId, expected: 'tag_1' },
    ],
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const deps = createOutputControllerDeps(node);
        vi.mocked(deps.homeAssistant.getTags).mockReturnValue([
            { tag_id: 'tag_1', name: 'My tag' },
        ] as any);
        const controller = new TagController(deps);
        await controller.onTagScanned({
            context: { user_id: 'user_1' },
            event: { device_id: 'device_1', tag_id: 'tag_1' },
        } as any);
        return sentMessage(node);
    },
});

describeOutputProperties({
    title: 'Number',
    specific: valueCases(5, 3),
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const controller = new NumberOutputController(
            createOutputControllerDeps(node),
        );
        await controller.onValueChange(5, 3);
        return sentMessage(node);
    },
});

describeOutputProperties({
    title: 'Select',
    specific: valueCases('b', 'a'),
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const controller = new SelectOutputController(
            createOutputControllerDeps(node),
        );
        await controller.onValueChange('b', 'a');
        return sentMessage(node);
    },
});

describeOutputProperties({
    title: 'Text',
    specific: valueCases('new', 'old'),
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const controller = new TextOutputController(
            createOutputControllerDeps(node),
        );
        await controller.onValueChange('new', 'old');
        return sentMessage(node);
    },
});

describeOutputProperties({
    title: 'Time entity',
    specific: valueCases('12:30:00', '11:00:00'),
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const controller = new TimeEntityOutputController(
            createOutputControllerDeps(node),
        );
        await controller.onValueChange('12:30:00', '11:00:00');
        return sentMessage(node);
    },
});

describeOutputProperties({
    title: 'Sentence',
    specific: [
        {
            name: 'triggerId',
            valueType: T.TriggerId,
            expected: 'turn on the light',
        },
        { name: 'results', valueType: T.Results, expected: { slot: 'light' } },
        { name: 'deviceId', valueType: T.DeviceId, expected: 'device_1' },
    ],
    async run(outputProperties, node) {
        node.config.outputProperties = outputProperties;
        const controller = new SentenceOutputController(
            createOutputControllerDeps(node),
        );
        await controller.onReceivedMessage({
            sentence: 'turn on the light',
            result: { slot: 'light' },
            deviceId: 'device_1',
            responseId: 7,
        });
        return sentMessage(node);
    },
});
