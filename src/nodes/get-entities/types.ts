import { PropertySelectorType } from '../../common/const';

export type Rule = {
    condition?: PropertySelectorType;
    property: string;
    logic: string;
    value: string;
    valueType: string;
};
