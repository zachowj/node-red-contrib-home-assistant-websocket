export default [
    {
        version: 0,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 0,
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
                outputType: schema.output_type,
                outputEmptyResults: schema.output_empty_results,
                outputLocationType: schema.output_location_type,
                outputLocation: schema.output_location,
                outputResultsCount: schema.output_results_count,
            };
            newSchema.output_type = undefined;
            newSchema.output_empty_results = undefined;
            newSchema.output_location_type = undefined;
            newSchema.output_location = undefined;
            newSchema.output_results_count = undefined;

            return newSchema;
        },
    },
];
