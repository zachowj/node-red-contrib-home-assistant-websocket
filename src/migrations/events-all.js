const migrations = [
    {
        version: 0,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 0,
                waitForRunning:
                    schema.waitForRunning !== undefined
                        ? schema.waitForRunning
                        : true,
            };
            return newSchema;
        },
    },
    {
        version: 1,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 1,
                outputProperties: [
                    {
                        property: 'payload',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'eventData',
                    },
                    {
                        property: 'topic',
                        propertyType: 'msg',
                        value: '$eventData().event_type',
                        valueType: 'jsonata',
                    },
                    {
                        property: 'event_type',
                        propertyType: 'msg',
                        value: '$eventData().event_type',
                        valueType: 'jsonata',
                    },
                ],
            };
            return newSchema;
        },
    },
];

module.exports = migrations;
