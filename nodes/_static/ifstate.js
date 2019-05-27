// eslint-disable-next-line no-unused-vars
var ifState = (function($) {
    let $input;

    const resize = function() {
        const $clearIfState = $('#clearIfState');

        if (!$input.hasClass('red-ui-typedInput')) return;

        let width =
            $('#node-input-name').width() -
            $('#node-input-halt_if_compare').outerWidth();

        if ($clearIfState.is(':visible')) {
            width = width - $clearIfState.outerWidth(true);
        }

        $input.typedInput('width', width);
    };

    const init = function(input, compare, nodeName) {
        $('#errorIfState').remove();

        $input = $(input);
        const $compare = $(compare);
        const entityType = { value: 'entity', label: 'entity.' };
        let defaultTypes = [
            'str',
            'num',
            'bool',
            're',
            'msg',
            'flow',
            'global',
            entityType
        ];

        if (nodeName !== 'currentState') {
            defaultTypes.splice(4, 1);
        }

        $input.after(
            ' <a id="clearIfState" class="editor-button"><i class="fa fa-remove"></i></a>'
        );
        const $clearIfState = $('#clearIfState');

        $input.typedInput({
            default: 'str',
            types: defaultTypes,
            typeField: '#node-input-halt_if_type'
        });

        $compare.change(function(e) {
            let types = defaultTypes;
            let extraTypes = ['flow', 'global', entityType];

            if (defaultTypes.includes('msg')) {
                extraTypes = ['msg'].concat(extraTypes);
            }

            switch (e.target.value) {
                case 'is':
                case 'is_not':
                    break;
                case 'lt':
                case 'lte':
                case 'gt':
                case 'gte':
                    types = ['num'].concat(extraTypes);
                    break;
                case 'includes':
                case 'does_not_include':
                    types = ['str'].concat(extraTypes);
                    break;
            }
            $input.typedInput('types', types);
        });

        $compare.trigger('change');

        $input.on('change', function(e) {
            if (e.currentTarget.value) {
                $clearIfState.show();
                resize($input);
            }
        });

        $clearIfState.on('click', function() {
            $input.typedInput('type', 'str');
            $input.typedInput('value', '');
            $(this).hide();
            resize($input);
        });

        if (!$input.val()) {
            $clearIfState.hide();
            resize($input);
        }
        resize($input);
    };

    return {
        init,
        resize
    };

    // eslint-disable-next-line no-undef
})(jQuery);
