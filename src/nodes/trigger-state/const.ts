import { ComparatorType, TypedInputTypes } from '../../const';

export const DISABLE = 'disable';
export const ENABLE = 'enable';

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

export enum MessageType {
    Default = 'default',
    Custom = 'custom',
    Payload = 'payload',
}

export enum ComparatorPropertyType {
    Always = 'always',
    CurrentState = 'current_state',
    PreviousState = 'previous_state',
    Property = 'property',
}

export interface CustomOutput {
    messageType: MessageType;
    messageValue: string;
    messageValueType: TypedInputTypes;
    comparatorPropertyType: ComparatorPropertyType;
    comparatorPropertyValue: string;
    comparatorType: ComparatorType;
    comparatorValue: string;
    comparatorValueDataType: TypedInputTypes;
}
