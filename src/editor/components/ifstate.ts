import { HATypedInputTypeOptions } from '../types';

export const init = function (
    input: string,
    compare: string,
    nodeName?: string
) {
    const $input = $(input);
    const $compare = $(compare);
    const entityType = { value: 'entity', label: 'entity.' };
    const defaultTypes: HATypedInputTypeOptions = [
        'str',
        'num',
        'bool',
        're',
        'jsonata',
        'msg',
        'flow',
        'global',
        entityType,
    ];

    if (nodeName !== 'currentState') {
        defaultTypes.splice(5, 1);
    }

    $input.after(
        ' <a id="clearIfState" class="editor-button"><i class="fa fa-remove"></i></a>'
    );
    const $clearIfState = $('#clearIfState');

    $input.typedInput({
        default: 'str',
        types: defaultTypes,
        typeField: '#node-input-halt_if_type',
    });

    $compare.on('change', function () {
        const $this = $(this as HTMLSelectElement);
        let types = defaultTypes;
        let extraTypes: HATypedInputTypeOptions = [
            'flow',
            'global',
            entityType,
        ];

        if (defaultTypes.includes('msg')) {
            extraTypes = ['msg', ...extraTypes];
        }

        switch ($this.val()) {
            case 'is':
            case 'is_not':
                break;
            case 'lt':
            case 'lte':
            case 'gt':
            case 'gte':
                types = ['num', 'jsonata', ...extraTypes];
                break;
            case 'includes':
            case 'does_not_include':
                types = ['str', 'jsonata', ...extraTypes];
                break;
            case 'jsonata':
                types = ['jsonata'];
                break;
        }
        $input.typedInput('types', types);
    });

    $compare.trigger('change');

    $input.on('change', function () {
        if ($(this).val()) $clearIfState.show();
    });

    $clearIfState.on('click', (e) => {
        $input.typedInput('type', 'str');
        $input.typedInput('value', '');
        $(e.currentTarget).hide();
    });

    if (!$input.val()) {
        $clearIfState.hide();
    }
};
