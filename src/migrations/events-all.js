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
];

module.exports = migrations;
