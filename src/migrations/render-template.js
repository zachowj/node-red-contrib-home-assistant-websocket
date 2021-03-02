const migrations = [
    {
        version: 0,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 0,
            };
            if (newSchema.templateLocationType === undefined) {
                newSchema.templateLocation = 'template';
                newSchema.templateLocationType = 'msg';
            }
            if (newSchema.resultsLocationType === undefined) {
                newSchema.resultsLocation = 'payload';
                newSchema.resultsLocationType = 'msg';
            }
            return newSchema;
        },
    },
];

module.exports = migrations;
