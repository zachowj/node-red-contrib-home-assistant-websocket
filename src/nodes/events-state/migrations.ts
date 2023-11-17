export default [
    {
        version: 0,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 0,
                state_type:
                    schema.state_type !== undefined ? schema.state_type : 'str',
                halt_if_type:
                    schema.halt_if_type !== undefined
                        ? schema.halt_if_type
                        : 'str',
                halt_if_compare:
                    schema.halt_if_compare !== undefined
                        ? schema.halt_if_compare
                        : 'is',
            };

            return newSchema;
        },
    },
    {
        // CHANGES:
        // - if state changed to send true condition to the first out and false to the second
        version: 1,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 1,
                ignorePrevStateNull: false,
                ignorePrevStateUnknown: false,
                ignorePrevStateUnavailable: false,
                ignoreCurrentStateUnknown: false,
                ignoreCurrentStateUnavailable: false,
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
                for: schema.for !== undefined ? schema.for : '0',
                forType: schema.forType || 'num',
                forUnits: schema.forUnits || 'minutes',
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
                outputProperties: [
                    {
                        property: 'payload',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'entityState',
                    },
                    {
                        property: 'data',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'eventData',
                    },
                    {
                        property: 'topic',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'triggerId',
                    },
                ],
            };

            return newSchema;
        },
    },
    {
        version: 4,
        up: (schema: any) => {
            const newSchema: {
                version: number;
                entityidfilter: string | string[];
                entityidfiltertype: 'exact' | 'substring' | 'regex' | 'list';
            } = {
                ...schema,
                version: 4,
            };

            if (
                schema.entityidfiltertype === 'substring' &&
                schema.entityidfilter?.includes(',')
            ) {
                newSchema.entityidfiltertype = 'list';
                newSchema.entityidfilter = schema.entityidfilter
                    .split(',')
                    .map((e: string) => e.trim())
                    .filter((e: string) => e.length > 0);
            }
            return newSchema;
        },
    },
    {
        version: 5,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 5,
                entityId: schema.entityidfilter,
                entityIdType: schema.entityidfiltertype,
                ifState: schema.haltifstate,
                ifStateType: schema.halt_if_type,
                ifStateOperator: schema.halt_if_compare,
                outputInitially: schema.outputinitially,
                stateType: schema.state_type,
                outputOnlyOnStateChange: schema.output_only_on_state_change,
                exposeAsEntityConfig: '',
            };

            newSchema.entityidfilter = undefined;
            newSchema.entityidfiltertype = undefined;
            newSchema.haltifstate = undefined;
            newSchema.halt_if_type = undefined;
            newSchema.halt_if_compare = undefined;
            newSchema.outputinitially = undefined;
            newSchema.state_type = undefined;
            newSchema.output_only_on_state_change = undefined;
            newSchema.exposeToHomeAssistant = undefined;
            newSchema.haConfig = undefined;

            return newSchema;
        },
    },
];
