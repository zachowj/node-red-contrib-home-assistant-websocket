RED.nodes.registerType('api-render-template', {
    category: 'home_assistant',
    color: '#5BCBF7',
    inputs: 1,
    outputs: 1,
    icon: 'ha-render-template.svg',
    paletteLabel: 'get template',
    label: function () {
        return this.name || `template: ${this.template || ''}`;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        template: { value: '' },
        resultsLocation: { value: 'payload' },
        resultsLocationType: { value: 'msg' },
        templateLocation: { value: 'template' },
        templateLocationType: { value: 'msg' },
    },
    oneditprepare: function () {
        const $server = $('#node-input-server');
        const utils = {
            setDefaultServerSelection: function () {
                let defaultServer;
                RED.nodes.eachConfig((n) => {
                    if (n.type === 'server' && !defaultServer)
                        defaultServer = n.id;
                });
                if (defaultServer) $server.val(defaultServer);
            },
        };

        if (!this.server) {
            utils.setDefaultServerSelection();
        }

        const $inputTemplate = $('#node-input-template');

        if (this.templateLocation === undefined) {
            $('#node-input-templateLocation').val('template');
        }
        if (this.resultsLocation === undefined) {
            $('#node-input-resultsLocation').val('payload');
        }
        $('#node-input-templateLocation').typedInput({
            types: [
                'msg',
                'flow',
                'global',
                { value: 'none', label: 'none', hasValue: false },
            ],
            typeField: '#node-input-templateLocationType',
        });

        $('#node-input-resultsLocation').typedInput({
            types: [
                'msg',
                'flow',
                'global',
                { value: 'none', label: 'none', hasValue: false },
            ],
            typeField: '#node-input-resultsLocationType',
        });

        // NOTE: Copypasta from node-red/nodes/core/template node
        // TODO: How to get jinja syntax highlighting with ace editor?
        // TODO: Add a preview render button for testing (or call render on debounced keyup)
        this.editor = RED.editor.createEditor({
            id: 'node-input-template-editor',
            value: $inputTemplate.val(),
        });
        this.editor.focus();
    },
    oneditresize: function (size) {
        const $rows = $('#dialog-form>div:not(.node-text-editor-row)');
        const $editorRow = $('#dialog-form>div.node-text-editor-row');
        const $textEditor = $('.node-text-editor');
        const $dialogForm = $('#dialog-form');

        let height = $dialogForm.height();
        for (let i = 0; i < $rows.size(); i++) {
            height -= $($rows[i]).outerHeight(true);
        }
        height -=
            parseInt($editorRow.css('marginTop')) +
            parseInt($editorRow.css('marginBottom'));

        $textEditor.css('height', `${height}px`);
        this.editor.resize();
    },
    oneditcancel: function () {
        this.editor.destroy();
        delete this.editor;
    },
    oneditsave: function () {
        const newValue = this.editor.getValue();
        $('#node-input-template').val(newValue);
        this.editor.destroy();
        delete this.editor;
    },
});
