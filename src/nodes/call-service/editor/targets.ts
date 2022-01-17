import { SearchOptions } from 'select2';

import * as haData from '../../../editor/data';
import { Select2Data, select2DefaultOptions } from '../../../editor/select2';
import { byPropertiesOf } from '../../../helpers/sort';
import { FilterEntities } from '.';

declare global {
    interface JQuery {
        maximizeSelect2Height: () => void;
    }
}

const createSelect2Options = (data) => {
    return {
        ...select2DefaultOptions,
        ...{
            multiple: true,
            tags: true,
            data: data,
            // Only allow custom entities if they contain mustache tags
            createTag: (params: SearchOptions) => {
                // Check for valid mustache tags
                if (!/\{\{(?:(?!}}).+)\}\}/g.test(params.term)) {
                    return null;
                }

                return {
                    id: params.term,
                    text: params.term,
                };
            },
        },
    };
};

// Create select2 data list of ids that don't exist in the current list
const createCustomIdList = (ids, list) => {
    return ids.reduce((acc: Select2Data[], entityId: string) => {
        if (!(entityId in list)) {
            acc.push({
                id: entityId,
                text: entityId,
                selected: true,
            });
        }
        return acc;
    }, []);
};

// Load entity list into select2
export const populateEntities = (
    serverId: string,
    {
        selectedIds,
        filter,
    }: {
        selectedIds?: string[];
        filter?: FilterEntities;
    }
) => {
    const $entityIdField = $('#node-input-entityId');
    const entities = haData.getEntities(serverId);
    const entitiesValues = Object.values(entities);
    const entityIds = selectedIds ?? ($entityIdField.val() as string[]);
    $entityIdField.empty();
    const data = (filter ? entitiesValues.filter(filter) : entitiesValues)
        .map((e): Select2Data => {
            return {
                id: e.entity_id,
                text: e.attributes.friendly_name ?? e.entity_id,
                selected: entityIds.includes(e.entity_id),
                title: e.entity_id,
            };
        })
        .sort(byPropertiesOf<Select2Data>(['text']))
        .concat(createCustomIdList(entityIds, entities));
    $entityIdField.select2(createSelect2Options(data)).maximizeSelect2Height();
};
