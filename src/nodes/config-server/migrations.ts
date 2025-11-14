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
                ha_boolean: schema.ha_boolean || 'y|yes|true|on|home|open',
                rejectUnauthorizedCerts:
                    schema.rejectUnauthorizedCerts !== undefined
                        ? schema.rejectUnauthorizedCerts
                        : true,
                connectionDelay:
                    schema.connectionDelay !== undefined
                        ? schema.connectionDelay
                        : true,
                cacheJson:
                    schema.cacheJson !== undefined ? schema.cacheJson : true,
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
                heartbeat: false,
                heartbeatInterval: 30,
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
                areaSelector: 'friendlyName',
                deviceSelector: 'friendlyName',
                entitySelector: 'friendlyName',
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
                statusSeparator: 'at: ',
                statusYear: 'hidden',
                statusMonth: 'short',
                statusDay: 'numeric',
                statusHourCycle: 'h23',
                statusTimeFormat: 'h:m',
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
                enableGlobalContextStore: true,
            };
            return newSchema;
        },
    },
    {
        version: 6,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 6,
            };

            // Migrate ha_boolean delimiter string to array of unique values
            let haBoolArr: string[] = [];
            if (typeof schema.ha_boolean === 'string') {
                haBoolArr = schema.ha_boolean.split('|');
            }
            const haBoolSet = new Set(
                haBoolArr.map((item: string) => item.toLowerCase().trim()),
            );
            newSchema.ha_boolean = Array.from(haBoolSet);
            return newSchema;
        },
    },
];
