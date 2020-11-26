// eslint-disable-next-line no-unused-vars, no-var
var ifState = (function ($) {
    let $input;

    const init = function (input, compare, nodeName) {
        $input = $(input);
        const $compare = $(compare);
        const entityType = { value: 'entity', label: 'entity.' };
        const defaultTypes = [
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

        $compare.on('change', (e) => {
            let types = defaultTypes;
            let extraTypes = ['flow', 'global', entityType];

            if (defaultTypes.includes('msg')) {
                extraTypes = ['msg', ...extraTypes];
            }

            switch (e.target.value) {
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

        $input.on('change', (e) => {
            if (e.currentTarget.value) $clearIfState.show();
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

    return {
        init,
    };

    // eslint-disable-next-line no-undef
})(jQuery);
