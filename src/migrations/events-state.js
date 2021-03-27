const migrations = [
    {
        version: 0,
        up: (schema) => {
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
        up: (schema) => {
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
        up: (schema) => {
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
        up: (schema) => {
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
];

module.exports = migrations;
