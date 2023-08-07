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
                exposeAsEntityConfig: '',
            };

            newSchema.exposeToHomeAssistant = undefined;
            newSchema.haConfig = undefined;

            return newSchema;
        },
    },
];
