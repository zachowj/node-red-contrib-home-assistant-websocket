export default [
    {
        version: 0,
        up: (schema: any) => {
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
        up: (schema: any) => {
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
                        value: '$outputData("eventData").event_type',
                        valueType: 'jsonata',
                    },
                    {
                        property: 'event_type',
                        propertyType: 'msg',
                        value: '$outputData("eventData").event_type',
                        valueType: 'jsonata',
                    },
                ],
            };
            return newSchema;
        },
    },
];
