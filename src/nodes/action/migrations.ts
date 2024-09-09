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
        // entity_id moved from the data property to its on property
        version: 1,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 1,
            };
            try {
                const data = JSON.parse(schema.data);
                if (data.entity_id) {
                    newSchema.entityId = data.entity_id;
                    delete data.entity_id;
                    newSchema.data = !Object.keys(data).length
                        ? ''
                        : JSON.stringify(data);
                } else {
                    newSchema.entityId = '';
                }
            } catch (e) {}

            return newSchema;
        },
    },
    {
        version: 2,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 2,
                outputProperties: [],
            };

            if (schema.output_location_type !== 'none') {
                newSchema.outputProperties = [
                    {
                        property: schema.output_location,
                        propertyType: schema.output_location_type,
                        value: '',
                        valueType: 'data',
                    },
                ];
            }

            return newSchema;
        },
    },
    {
        version: 3,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 3,
                queue: 'none',
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
                target: {
                    entityId: schema?.entityId
                        ? schema.entityId
                              .split(',')
                              .map((e: string) => e.trim())
                        : [],
                    areaId: [],
                    deviceId: [],
                },
                domain: schema.service_domain,
                mergeContext: schema.mergecontext,
                entityId: undefined,
                service_domain: undefined,
                mergecontext: undefined,
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
                areaId: schema.target?.areaId,
                deviceId: schema.target?.deviceId,
                entityId: schema.target?.entityId,
                target: undefined,
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
                floorId: [],
                labelId: [],
            };

            if (schema.domain || schema.service) {
                newSchema.action = `${schema.domain}.${schema.service}`;
            }

            return newSchema;
        },
    },
    {
        version: 7,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 7,
                blockInputOverrides: false,
            };

            return newSchema;
        },
    },
];
