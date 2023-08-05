import { TypedInputTypes } from '../../const';

export default [
    {
        version: 0,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 0,
            };
            return newSchema;
        },
    },
    {
        version: 1,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 1,
                state_type: 'str',
                halt_if_type: 'str',
                halt_if_compare: 'is',
                updateIntervalUnits: 'seconds',
            };
            return newSchema;
        },
    },
    {
        version: 2,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 2,
                updateIntervalType: 'num',
            };
            return newSchema;
        },
    },
    {
        version: 3,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 3,
                entityId: schema.entity_id,
                exposeAsEntityConfig: '',
                ifState: schema.halt_if,
                ifStateType: schema.halt_if_type,
                ifStateOperator: schema.halt_if_compare,
                outputInitially: schema.outputinitially,
                outputOnChanged: schema.outputonchanged,
                outputProperties: [
                    {
                        property: 'payload',
                        propertyType: TypedInputTypes.Message,
                        value: '',
                        valueType: 'entityState',
                    },
                    {
                        property: 'data',
                        propertyType: TypedInputTypes.Message,
                        value: '',
                        valueType: 'entity',
                    },
                    {
                        property: 'topic',
                        propertyType: TypedInputTypes.Message,
                        value: '',
                        valueType: 'triggerId',
                    },
                ],
                stateType: schema.state_type,
                updateInterval: schema.updateinterval,
            };

            newSchema.entity_id = undefined;
            newSchema.updateinterval = undefined;
            newSchema.outputinitially = undefined;
            newSchema.outputonchanged = undefined;
            newSchema.state_type = undefined;
            newSchema.halt_if = undefined;
            newSchema.halt_if_type = undefined;
            newSchema.halt_if_compare = undefined;
            newSchema.exposeToHomeAssistant = undefined;
            newSchema.haConfig = undefined;

            return newSchema;
        },
    },
];
