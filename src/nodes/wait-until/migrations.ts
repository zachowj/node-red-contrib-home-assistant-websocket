import { IdSelectorType } from '../../common/const';
import { TypedInputTypes } from '../../const';

export default [
    {
        version: 0,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 0,
                entityIdFilterType: schema.entityIdFilterType || 'exact',
                timeoutType: schema.timeoutType || 'num',
            };

            if (newSchema.blockInputOverrides === undefined) {
                newSchema.blockInputOverrides = true;
            }
            if (newSchema.checkCurrentState === undefined) {
                newSchema.checkCurrentState = false;
            }
            return newSchema;
        },
    },
    {
        version: 1,
        up: (schema: any) => {
            const newSchema: {
                version: number;
                entityId: string | string[];
                entityIdFilterType: 'exact' | 'substring' | 'regex' | 'list';
            } = {
                ...schema,
                version: 1,
            };

            if (
                schema.entityIdFilterType === 'substring' &&
                schema.entityId?.includes(',')
            ) {
                newSchema.entityIdFilterType = 'list';
                newSchema.entityId = schema.entityId
                    .split(',')
                    .map((e: string) => e.trim())
                    .filter((e: string) => e.length > 0);
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
                outputProperties: [],
                entityLocation: undefined,
                entityLocationType: undefined,
            };

            if (schema.entityLocationType !== 'none') {
                newSchema.outputProperties.push({
                    property: schema.entityLocation,
                    propertyType: schema.entityLocationType,
                    value: '',
                    valueType: TypedInputTypes.Entity,
                });
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
                entities: [],

                entityId: undefined,
                entityIdFilterType: undefined,
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
            switch (schema.entityIdFilterType) {
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
