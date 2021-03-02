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
];

module.exports = migrations;
