export default [
    {
        version: 0,
        up: (schema: any) => {
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
    {
        version: 1,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 1,

                startDate: schema.startdate,
                endDate: schema.enddate,
                entityId: schema.entityid,
                outputType: schema.output_type,
                outputLocationType: schema.output_location_type,
                outputLocation: schema.output_location,
                entityIdType:
                    schema.entityidtype === 'includes' ? 'regex' : 'equals',
            };

            newSchema.startdate = undefined;
            newSchema.enddate = undefined;
            newSchema.entityid = undefined;
            newSchema.entityidtype = undefined;
            newSchema.output_type = undefined;
            newSchema.output_location_type = undefined;
            newSchema.output_location = undefined;

            return newSchema;
        },
    },
];
