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
                sunday: true,
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
            };
            return newSchema;
        },
    },
];

module.exports = migrations;
