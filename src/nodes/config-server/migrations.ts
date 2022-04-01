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
];
