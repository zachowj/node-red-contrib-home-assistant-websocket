import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { PropertySelectorType } from '../../common/const';
import { ComparatorType, NodeType, TypedInputTypes } from '../../const';
import PropertySelector, {
    getRules,
} from '../../editor/components/propertySelector/PropertySelector';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { insertSocialBar } from '../../editor/socialbar';
import { OutputType } from './const';
import { Rule } from './types';

declare const RED: EditorRED;

interface GetEntitiesEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    rules: Rule[];
    outputType: OutputType;
    outputEmptyResults: boolean;
    outputLocationType: string;
    outputLocation: string;
    outputResultsCount: number;

    // deprecated
    output_type: undefined;
    output_empty_results: undefined;
    output_location_type: undefined;
    output_location: undefined;
    output_results_count: undefined;
}

const GetEntitiesEditor: EditorNodeDef<GetEntitiesEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'ha-get-entities.svg',
    paletteLabel: 'get entities',
    label: function () {
        return this.name || 'get entities';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haGetEntitiesVersion', 0) },
        rules: {
            value: [
                {
                    condition: PropertySelectorType.State,
                    property: '',
                    logic: ComparatorType.Is,
                    value: '',
                    valueType: TypedInputTypes.String,
                },
            ],
        },
        outputType: { value: OutputType.Array },
        outputEmptyResults: { value: false },
        outputLocationType: { value: TypedInputTypes.Message },
        outputLocation: { value: 'payload' },
        outputResultsCount: {
            value: 1,
            validate: function (v) {
                if ($('#node-input-outputType').val() === OutputType.Random) {
                    return Number.isInteger(Number(v));
                }
                return true;
            },
        },

        // deprecated
        output_type: { value: undefined },
        output_empty_results: { value: undefined },
        output_location_type: { value: undefined },
        output_location: { value: undefined },
        output_results_count: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server', () => {
            propertySelector.refreshOptions();
        });

        const propertySelector = new PropertySelector({
            element: '#conditions-list',
            types: [
                PropertySelectorType.State,
                PropertySelectorType.Device,
                PropertySelectorType.Area,
                PropertySelectorType.Floor,
                PropertySelectorType.Label,
            ],
        });
        this.rules.forEach((rule) => {
            propertySelector.addId(rule);
        });

        $('#node-input-outputLocation').typedInput({
            types: [
                TypedInputTypes.Message,
                TypedInputTypes.Flow,
                TypedInputTypes.Global,
            ],
            typeField: '#node-input-outputLocationType',
        });

        $('#node-input-outputResultsCount').spinner({ min: 1 });

        $('#node-input-outputType')
            .on('change', function () {
                $('.output-option').hide();
                switch ($(this).val() as string) {
                    case OutputType.Array:
                        $('#output_empty_results').show();
                        $('#output_location').show();
                        break;
                    case OutputType.Count:
                        $('#output_location').show();
                        break;
                    case OutputType.Random:
                        $('#output_results_count').show();
                        $('#output_location').show();
                        break;
                    case OutputType.Split:
                    default:
                        break;
                }
            })
            .trigger('change');

        insertSocialBar('get-entities');
    },
    oneditsave: function () {
        this.rules = getRules('#conditions-list');
    },
};

export default GetEntitiesEditor;
