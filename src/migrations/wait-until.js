const migrations = [
    {
        version: 0,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 0,
                entityIdFilterType: schema.entityIdFilterType || 'exact',
                timeoutType: schema.timeoutType || 'num',
            };

            if (newSchema.blockInputOverrides === undefined) {
                newSchema.blockInputOverrides = true;
            }
            if (newSchema.checkCurrentState === undefined) {
                newSchema.checkCurrentState = false;
            }
            return newSchema;
        },
    },
];

module.exports = migrations;
