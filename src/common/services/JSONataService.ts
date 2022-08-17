import { random, sampleSize } from 'lodash';
import { Node } from 'node-red';

import { RED } from '../../globals';
import HomeAssistant from '../../homeAssistant/HomeAssistant';

export default class JSONataService {
    private readonly homeAssistant?: HomeAssistant;
    private readonly node: Node;

    constructor({
        homeAssistant,
        node,
    }: {
        homeAssistant?: HomeAssistant;
        node: Node;
    }) {
        this.homeAssistant = homeAssistant;
        this.node = node;
    }

    evaluate(expression: string, objs: Record<string, any> = {}) {
        const expr = RED.util.prepareJSONataExpression(expression, this.node);
        const { entity, message, prevEntity } = objs;

        expr.assign('entity', () => entity);
        expr.assign('entities', (val: string) =>
            this?.homeAssistant?.websocket?.getStates(val)
        );
        expr.assign('outputData', (obj: string) => {
            if (!obj) {
                const filtered = Object.keys(objs).reduce((acc, key) => {
                    // ignore message as it already accessable
                    if (key !== 'message' && objs[key] !== undefined) {
                        acc[key] = objs[key];
                    }
                    return acc;
                }, {} as Record<string, any>);
                return filtered;
            }

            return objs[obj];
        });
        expr.assign('prevEntity', () => prevEntity);
        expr.assign('randomNumber', random);
        expr.assign('sampleSize', sampleSize);

        return RED.util.evaluateJSONataExpression(expr, message);
    }
}
