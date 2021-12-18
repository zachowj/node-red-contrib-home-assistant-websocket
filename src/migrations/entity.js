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
                inputOverride: 'allow',
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
            };

            newSchema.config.push({ property: 'state_class', value: '' });
            newSchema.config.push({ property: 'last_reset', value: '' });

            return newSchema;
        },
    },
];

module.exports = migrations;
