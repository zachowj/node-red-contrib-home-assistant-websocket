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
                inputs: 1,
                enableInput: true,
            };
            return newSchema;
        },
    },
    {
        version: 2,
        up: (schema: {
            version: number;
            entityid: string;
            entityidfiltertype: 'exact' | 'substring' | 'regex';
        }) => {
            const newSchema: {
                version: number;
                entityid: string | string[];
                entityidfiltertype: 'exact' | 'substring' | 'regex' | 'list';
            } = {
                ...schema,
                version: 2,
            };

            if (
                schema.entityidfiltertype === 'substring' &&
                schema.entityid?.includes(',')
            ) {
                newSchema.entityidfiltertype = 'list';
                newSchema.entityid = schema.entityid
                    .split(',')
                    .map((e) => e.trim())
                    .filter((e) => e.length > 0);
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
                entityId: schema.entityConfigNode,
                entityIdType: schema.entityidfiltertypeentityConfigNode,
                debugEnabled: schema.debugenabledentityConfigNode,
                customOutputs: schema.customoutputsentityConfigNode,
                outputInitially: schema.outputinitiallyentityConfigNode,
                StateType: schema.state_typeentityConfigNode,
                exposeAsEntityConfig: '',
            };

            newSchema.entityid = undefined;
            newSchema.entityidfiltertype = undefined;
            newSchema.debugenabled = undefined;
            newSchema.customoutputs = undefined;
            newSchema.outputinitially = undefined;
            newSchema.state_type = undefined;
            newSchema.enableInput = undefined;

            return newSchema;
        },
    },
];
