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
        // entity_id moved from the data property to its on property
        version: 1,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 1,
            };
            try {
                const data = JSON.parse(schema.data);
                if (data.entity_id) {
                    newSchema.entityId = data.entity_id;
                    delete data.entity_id;
                    newSchema.data = !Object.keys(data).length
                        ? ''
                        : JSON.stringify(data);
                } else {
                    newSchema.entityId = '';
                }
            } catch (e) {}

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
            };

            if (schema.output_location_type !== 'none') {
                newSchema.outputProperties = [
                    {
                        property: schema.output_location,
                        propertyType: schema.output_location_type,
                        value: '',
                        valueType: 'data',
                    },
                ];
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
                queue: 'none',
            };

            return newSchema;
        },
    },
];

module.exports = migrations;
