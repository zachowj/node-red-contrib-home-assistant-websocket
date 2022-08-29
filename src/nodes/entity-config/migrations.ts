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
            };
            return newSchema;
        },
    },
    {
        version: 2,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 2,
            };
            return newSchema;
        },
    },
    {
        version: 3,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 3,
            };
            return newSchema;
        },
    },
    {
        version: 4,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 4,
            };
            return newSchema;
        },
    },
    {
        version: 5,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 5,
            };
            return newSchema;
        },
    },
    // Empty migrations above because the mirgration were not configured correctly
    {
        version: 6,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 6,
            };
            return newSchema;
        },
    },
];
