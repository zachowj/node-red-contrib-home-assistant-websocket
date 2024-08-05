import { IdSelectorType } from '../../common/const';

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
        up: (schema: any) => {
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
                    .map((e: string) => e.trim())
                    .filter((e: string) => e.length > 0);
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
                entityId: schema.entityid,
                entityIdType: schema.entityidfiltertype,
                debugEnabled: schema.debugenabled,
                customOutputs: schema.customoutputs,
                outputInitially: schema.outputinitially,
                stateType: schema.state_type,
                exposeAsEntityConfig: '',
            };

            newSchema.entityid = undefined;
            newSchema.entityidfiltertype = undefined;
            newSchema.debugenabled = undefined;
            newSchema.customoutputs = undefined;
            newSchema.outputinitially = undefined;
            newSchema.state_type = undefined;

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

            if (schema.stateType === undefined) {
                newSchema.stateType = 'str';
            }

            return newSchema;
        },
    },
    {
        version: 5,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 5,
                entities: [],

                entityId: undefined,
                entityIdType: undefined,
            };

            const entitites: {
                [IdSelectorType.Entity]: string[];
                [IdSelectorType.Substring]: string[];
                [IdSelectorType.Regex]: string[];
            } = {
                [IdSelectorType.Entity]: [],
                [IdSelectorType.Substring]: [],
                [IdSelectorType.Regex]: [],
            };
            switch (schema.entityIdType) {
                case 'list':
                    entitites[IdSelectorType.Entity] = schema.entityId;
                    break;
                case 'exact':
                    entitites[IdSelectorType.Entity] = [schema.entityId];
                    break;
                case 'substring':
                    entitites[IdSelectorType.Substring] = [schema.entityId];
                    break;
                case 'regex':
                    entitites[IdSelectorType.Regex] = [schema.entityId];
                    break;
            }
            newSchema.entities = entitites;

            return newSchema;
        },
    },
];
