import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { ComparatorType, TypedInputTypes } from '../../const';
import EntitySelector from '../../editor/components/EntitySelector';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { i18n } from '../../editor/i18n';
import { Constraint, PropertyType, TargetType } from './const';

declare const RED: EditorRED;

interface EventsCalendarEditorNodeProperties extends EditorNodeProperties {
    version: number;
    entityId: string | string[];
    constraints: Constraint[];
}

const EventsCalendarEditor: EditorNodeDef<EventsCalendarEditorNodeProperties> =
    {
        category: NodeCategory.HomeAssistant,
        color: NodeColor.HaBlue,
        inputs: 0,
        outputs: 1,
        outputLabels: ['Calendar event triggered'],
        icon: 'ha-events-calendar.svg',
        paletteLabel: 'events: calendar',
        label: function () {
            return this.name || `calendar_event`;
        },
        labelStyle: ha.labelStyle,
        defaults: {
            version: { value: RED.settings.get('eventsCalendarVersion', 0) },
            entityId: { value: '', required: true },
            constraints: {
                value: [
                    {
                        targetType: TargetType.ThisEntity,
                        targetValue: '',
                        propertyType: PropertyType.CurrentState,
                        propertyValue: 'new_state.state',
                        comparatorType: ComparatorType.Is,
                        comparatorValueDatatype: TypedInputTypes.String,
                        comparatorValue: '',
                    },
                ],
            },
        },
        oneditprepare: function () {
            ha.setup(this);
            const $constraintList = $('#constraint-list');

            const entitySelector = new EntitySelector({
                filterTypeSelector: '#node-input-entityIdType',
                entityId: this.entityId,
                serverId: haServer.getSelectedServerId(),
            });
            haServer.init(this, '#node-input-server', (serverId) => {
                entitySelector.serverChanged(serverId);
            });

            let availableProperties: string[] = [];
            let availablePropertiesPrefixed: string[] = [];
            haServer.autocomplete('entities', (entities: string[]) => {
                availableEntities = entities;
            });
            haServer.autocomplete('properties', (properties: string[]) => {
                availableProperties = properties;
                // prefix properties with new_state and old_state
                availablePropertiesPrefixed = [
                    ...properties.map((e) => `new_state.${e}`),
                    ...properties.map((e) => `old_state.${e}`),
                ].sort();
            });

            $constraintList.on('change', '.target-type', function () {
                const $this = $(this);
                const thisEntitySelected =
                    $this.val() === TargetType.ThisEntity;
                const $parent = $this.parent().parent();
                const $targetValue = $this.next();
                const $propertyType = $parent.find('.property-type');

                if (thisEntitySelected) {
                    $targetValue.attr('disabled', 'disabled').val('');
                } else {
                    $targetValue.removeAttr('disabled');
                }
                $propertyType
                    .find(`option[value=${PropertyType.PreviousState}]`)
                    .toggle(thisEntitySelected);
                if ($propertyType.val() === PropertyType.PreviousState) {
                    $propertyType
                        .val(PropertyType.CurrentState)
                        .trigger('change');
                }
            });
            $constraintList.on('change', '.property-type', function (e) {
                const val = e.target.value;
                if (
                    [
                        PropertyType.CurrentState,
                        PropertyType.PreviousState,
                    ].includes(val)
                ) {
                    $(this).next().attr('disabled', 'disabled').val('');
                } else {
                    $(this).next().removeAttr('disabled');
                }
            });

            let availableEntities: string[] = [];
            haServer.autocomplete('entities', (entities: string[]) => {
                availableEntities = entities;
            });

            const constraintListAddItem = (
                container: JQuery<HTMLElement>,
                index: number,
                data: Constraint
            ) => {
                $('#constraint-template')
                    .children()
                    .clone()
                    .appendTo(container);

                container.find('.target-value').autocomplete({
                    source: (req: any, cb: (entities: string[]) => void) => {
                        const term = req.term.toLowerCase();
                        const filiteredEntities = availableEntities.filter(
                            (entity) => entity.includes(term)
                        );
                        cb(filiteredEntities);
                    },
                    minLength: 0,
                });
                container.find('.property-value').autocomplete({
                    source: (req: any, cb: (entities: string[]) => void) => {
                        const term = req.term.toLowerCase();
                        const props =
                            container.find('.target-type').val() ===
                            TargetType.ThisEntity
                                ? availablePropertiesPrefixed
                                : availableProperties;
                        const filiteredProps = props.filter((prop) =>
                            prop.includes(term)
                        );

                        cb(filiteredProps);
                    },
                    minLength: 0,
                });
                container.find('.comparator-value').typedInput({
                    default: 'str',
                    types: [
                        'str',
                        'num',
                        'bool',
                        're',
                        'jsonata',
                        {
                            value: 'entity',
                            label: 'entity.',
                        },
                        {
                            value: 'prevEntity',
                            label: 'prev entity.',
                        },
                    ],
                });

                // Add Item clicked
                if ($.isEmptyObject(data)) return;

                container
                    .find('.target-type')
                    .val(data.targetType)
                    .trigger('change');
                container.find('.target-value').val(data.targetValue);
                container
                    .find('.property-type')
                    .val(data.propertyType)
                    .trigger('change');
                if (data.propertyType === PropertyType.Property) {
                    container.find('.property-value').val(data.propertyValue);
                }
                container.find('.comparator-type').val(data.comparatorType);

                const $comparatorValue = container.find('.comparator-value');
                $comparatorValue.typedInput(
                    'type',
                    data.comparatorValueDatatype
                );
                $comparatorValue.typedInput('value', data.comparatorValue);
            };

            $constraintList.editableList({
                addButton: true,
                removable: true,
                height: 'auto',
                header: $('<div>').append(
                    i18n('trigger-state.label.conditions')
                ),
                addItem: constraintListAddItem,
            });

            $constraintList.editableList(
                'addItems',
                this.constraints.length ? this.constraints : []
            );
        },
    };

export default EventsCalendarEditor;
