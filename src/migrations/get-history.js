const migrations = [
    {
        version: 0,
        up: (schema) => {
            const newSchema = {
                ...schema,
                version: 0,
                output_type:
                    schema.output_type === undefined
                        ? 'array'
                        : schema.output_type,
            };
            if (newSchema.output_location === undefined) {
                newSchema.output_location = 'payload';
                newSchema.output_location_type = 'msg';
            }
            return newSchema;
        },
    },
];

module.exports = migrations;
