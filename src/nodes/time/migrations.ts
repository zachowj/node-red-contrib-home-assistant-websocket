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
    {
        version: 2,
        up: (schema: any) => {
            const isDefaultPayload =
                schema.payloadType === 'jsonata' &&
                schema.payload === '$entity().state';
            const newSchema = {
                ...schema,
                version: 2,
                outputProperties: [
                    {
                        property: 'payload',
                        propertyType: 'msg',
                        value: isDefaultPayload ? '' : schema.payload,
                        valueType: isDefaultPayload
                            ? 'entityState'
                            : schema.payloadType,
                    },
                    {
                        property: 'data',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'entity',
                    },
                    {
                        property: 'topic',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'triggerId',
                    },
                ],
                payload: undefined,
                payloadType: undefined,
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

            newSchema.debugenabled = undefined;
            newSchema.exposeToHomeAssistant = undefined;
            newSchema.haConfig = undefined;

            return newSchema;
        },
    },
];
