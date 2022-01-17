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
                state_type: 'str',
                halt_if_type: 'str',
                halt_if_compare: 'is',
                updateIntervalUnits: 'seconds',
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
                updateIntervalType: 'num',
            };
            return newSchema;
        },
    },
];
