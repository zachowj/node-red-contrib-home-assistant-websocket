const migrations = [
    {
        version: 0,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 0,
            };

            return newSchema;
        },
    },
    {
        // CHANGES:
        // * if state changed to send true condition to the first out and false to the second
        // * typedInputs state_location and entity_location
        // * set defaults for new fields
        version: 1,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 1,
                blockInputOverrides: false,
                entity_location: 'data',
                halt_if_compare: 'is',
                override_payload:
                    schema.override_payload === false ? 'none' : 'msg',
                override_data: schema.override_data === false ? 'none' : 'msg',
                state_location: 'payload',
                state_type: 'str',
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
                outputProperties: [],
                state_location: undefined,
                override_payload: undefined,
                entity_location: undefined,
                override_data: undefined,
                override_topic: undefined,
            };

            if (schema.override_payload !== 'none') {
                newSchema.outputProperties.push({
                    property: schema.state_location,
                    propertyType: schema.override_payload,
                    value: '',
                    valueType: 'entityState',
                });
            }
            if (schema.override_data !== 'none') {
                newSchema.outputProperties.push({
                    property: schema.entity_location,
                    propertyType: schema.override_data,
                    value: '',
                    valueType: 'entity',
                });
            }
            if (schema.override_topic === true) {
                newSchema.outputProperties.push({
                    property: 'topic',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'triggerId',
                });
            }
            return newSchema;
        },
    },
    {
        version: 3,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 3,
                for: 0,
                forType: 'num',
                forUnits: 'minutes',
            };
            return newSchema;
        },
    },
];

module.exports = migrations;
