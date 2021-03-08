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
        version: 1,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 1,
                outputProperties: [],
                location: undefined,
                locationType: undefined,
            };

            if (schema.locationType !== 'none') {
                newSchema.outputProperties = [
                    {
                        property: schema.location,
                        propertyType: schema.locationType,
                        value: '',
                        valueType: 'results',
                    },
                ];
            }

            return newSchema;
        },
    },
];

module.exports = migrations;
