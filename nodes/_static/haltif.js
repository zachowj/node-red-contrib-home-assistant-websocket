const $ = window.jQuery;
const defaultTypes = ['str', 'num', 'bool', 're'];

const resizeHaltIf = function(input) {
    const $clearHaltIf = $('#clearHaltIf');
    let width =
        input.parent('div').width() -
        $('#node-input-halt_if_compare').width() -
        20.5;

    if ($clearHaltIf.is(':visible')) {
        width = width - $clearHaltIf.outerWidth(true) - 4;
    }

    input.typedInput('width', width);
};

window.resizeHaltIf = resizeHaltIf;

window.setupHaltIf = function(input, compare) {
    const $input = $(input);
    const $compare = $(compare);
    const $help = $('#halt_if_help');

    $input.after(
        ' <a id="clearHaltIf" class="editor-button"><i class="fa fa-remove"></i></a>'
    );
    const $clearHaltIf = $('#clearHaltIf');

    $input.typedInput({
        default: 'str',
        types: defaultTypes,
        typeField: '#node-input-halt_if_type'
    });

    $compare.change(function(e) {
        let types = defaultTypes;
        $help.hide();

        switch (e.target.value) {
            case 'is':
            case 'is_not':
                break;
            case 'lt':
            case 'lte':
            case 'gt':
            case 'gte':
                types = ['num'];
                break;
            case 'includes':
            case 'does_not_include':
                $help.show();
                types = ['str'];
                break;
        }
        $input.typedInput('types', types);
    });

    $compare.trigger('change');

    $input.on('change', function(e) {
        if (e.currentTarget.value) {
            $clearHaltIf.show();
            resizeHaltIf($input);
        }
    });

    $clearHaltIf.on('click', function() {
        $input.typedInput('type', 'str');
        $input.typedInput('value', '');
        $(this).hide();
        resizeHaltIf($input);
    });

    if (!$input.val()) {
        $clearHaltIf.hide();
        resizeHaltIf($input);
    }
    resizeHaltIf($input);
};
