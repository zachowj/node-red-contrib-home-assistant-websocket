import { SearchOptions } from 'select2';

import * as haData from '../../../editor/data';
import { Select2Data, select2DefaultOptions } from '../../../editor/select2';
import { byPropertiesOf } from '../../../helpers/sort';

declare global {
    interface JQuery {
        maximizeSelect2Height: () => void;
    }
}

// Load entity list into select2
export const populateEntities = (
    serverId: string,
    $entityIdField: JQuery,
    entityIds: string[]
) => {
    const entities = haData.getEntities(serverId);
    const entitiesValues = Object.values(entities);
    if (!entitiesValues) return;

    // Make list of custom entities to be added to entity list
    const customEntities = entityIds.reduce(
        (acc: Select2Data[], entityId: string) => {
            if (!(entityId in entities)) {
                acc.push({
                    id: entityId,
                    text: entityId,
                    selected: true,
                });
            }
            return acc;
        },
        []
    );
    $entityIdField.empty();
    $entityIdField
        .select2({
            ...select2DefaultOptions,
            ...{
                multiple: true,
                tags: true,
                data: entitiesValues
                    .map((e): Select2Data => {
                        return {
                            id: e.entity_id,
                            text: e.attributes.friendly_name ?? e.entity_id,
                            selected: entityIds.includes(e.entity_id),
                            title: e.entity_id,
                        };
                    })
                    .sort(byPropertiesOf<Select2Data>(['text']))
                    .concat(customEntities),
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
        })
        .maximizeSelect2Height();
};
