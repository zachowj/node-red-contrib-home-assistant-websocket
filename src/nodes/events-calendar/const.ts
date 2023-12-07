import { ComparatorType, TypedInputTypes } from '../../const';

export enum TargetType {
    ThisEntity = 'this_entity',
    EntityId = 'entity_id',
}

export enum PropertyType {
    CurrentState = 'current_state',
    PreviousState = 'previous_state',
    Property = 'property',
}

export interface Constraint {
    targetType: TargetType;
    targetValue: string;
    propertyType: PropertyType;
    propertyValue: string;
    comparatorType: ComparatorType;
    comparatorValueDatatype: TypedInputTypes;
    comparatorValue: string;
}
