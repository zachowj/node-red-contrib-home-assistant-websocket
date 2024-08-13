import { PropertySelectorType } from '../../common/const';
import { Rule } from './types';

export function sortConditions(conditions: Rule[]): Rule[] {
    const order = [
        PropertySelectorType.Label,
        PropertySelectorType.State,
        PropertySelectorType.Device,
        PropertySelectorType.Area,
        PropertySelectorType.Floor,
    ];

    return conditions.sort((a, b) => {
        const aIndex = order.indexOf(
            a?.condition ?? PropertySelectorType.State,
        );
        const bIndex = order.indexOf(
            b?.condition ?? PropertySelectorType.State,
        );

        return aIndex - bIndex;
    });
}
