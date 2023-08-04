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
                outputProperties: [
                    {
                        property: 'topic',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'triggerId',
                    },
                ],
                payloadLocation: undefined,
                payloadLocationType: undefined,
                headersLocation: undefined,
                headersLocationType: undefined,
            };

            if (schema.payloadLocationType !== 'none') {
                newSchema.outputProperties.push({
                    property: schema.payloadLocation,
                    propertyType: schema.payloadLocationType,
                    value: '',
                    valueType: 'data',
                });
            }
            if (schema.headersLocationType !== 'none') {
                newSchema.outputProperties.push({
                    property: schema.headersLocation,
                    propertyType: schema.headersLocationType,
                    value: '',
                    valueType: 'headers',
                });
            }
            return newSchema;
        },
    },
    {
        version: 2,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 2,
                method_post: true,
                method_put: true,
                method_get: false,
                method_head: false,
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
                exposeAsEntityConfig: '',
            };

            return newSchema;
        },
    },
];
