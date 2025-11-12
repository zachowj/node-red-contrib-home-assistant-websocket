import { ComparatorType, TypedInputTypes } from '../../const';
import { HATypedInputTypeOptions } from '../types';

export const init = function (
    input: string,
    type: string,
    compare: string,
    nodeName?: string,
) {
    const $input = $(input);
    const $compare = $(compare);
    const typedInputOptionEntity = {
        value: 'entity',
        label: 'entity.',
    } as const;
    const typedInputOptionHaBoolean = {
        value: 'habool',
        label: 'Home Assistant State Boolean',
        hasValue: false,
    } as const;
    const defaultTypes: HATypedInputTypeOptions = [
        TypedInputTypes.String,
        TypedInputTypes.Number,
        TypedInputTypes.Boolean,
        TypedInputTypes.Regex,
        TypedInputTypes.JSONata,
        TypedInputTypes.Message,
        TypedInputTypes.Flow,
        TypedInputTypes.Global,
        typedInputOptionEntity,
    ];

    // Remove 'msg' from all but current-state node because other nodes won't have a msg context
    if (nodeName !== 'currentState') {
        defaultTypes.splice(5, 1);
    }

    $input.after(
        ' <a id="clearIfState" class="editor-button"><i class="fa fa-remove"></i></a>',
    );
    const $clearIfState = $('#clearIfState');

    function availableTypes(operator: string): HATypedInputTypeOptions {
        let extraTypes: HATypedInputTypeOptions = [
            TypedInputTypes.Flow,
            TypedInputTypes.Global,
            typedInputOptionEntity,
        ];
        if (defaultTypes.includes(TypedInputTypes.Message)) {
            extraTypes = [TypedInputTypes.Message, ...extraTypes];
        }

        switch (operator) {
            case ComparatorType.Is:
            case ComparatorType.IsNot:
                break;
            case ComparatorType.IsLessThan:
            case ComparatorType.IsLessThanOrEqual:
            case ComparatorType.IsGreaterThan:
            case ComparatorType.IsGreaterThanOrEqual: {
                return [
                    TypedInputTypes.Number,
                    TypedInputTypes.JSONata,
                    ...extraTypes,
                ];
            }
            case ComparatorType.Includes:
            case ComparatorType.DoesNotInclude:
                return [
                    TypedInputTypes.String,
                    TypedInputTypes.JSONata,
                    ...extraTypes,
                    typedInputOptionHaBoolean,
                ];
            case ComparatorType.JSONata:
                return [TypedInputTypes.JSONata];
        }

        return defaultTypes;
    }

    $input.typedInput({
        default: TypedInputTypes.String,
        types: availableTypes($compare.val() as string),
        typeField: type,
    });

    $compare.on('change', function () {
        const $this = $(this as HTMLSelectElement);
        const types = availableTypes($this.val() as string);

        $input.typedInput('types', types);
    });

    $compare.trigger('change');

    $input.on('change', function () {
        if ($(this).val()) $clearIfState.show();
    });

    $clearIfState.on('click', (e) => {
        $input.typedInput('type', TypedInputTypes.String);
        $input.typedInput('value', '');
        $(e.currentTarget).hide();
    });

    if (!$input.val()) {
        $clearIfState.hide();
    }
};
