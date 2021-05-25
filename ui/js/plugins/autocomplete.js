/* globals haData: false */
(function ($) {
    $.fn.haAutocomplete = function (method) {
        const methods = {
            init: function (options) {
                this.haAutocomplete.settings = $.extend(
                    {},
                    this.haAutocomplete.defaults,
                    options
                );

                return this.each(function () {
                    const $element = $(this);
                    const serverId = $element.haAutocomplete.settings.serverId;
                    const type = $element.haAutocomplete.settings.type;
                    $element
                        .autocomplete({
                            source: (request, response) => {
                                const term = request.term;
                                const data = haData
                                    .getAutocompleteData(
                                        $(serverId).val(),
                                        type
                                    )
                                    .filter((item) => {
                                        return (
                                            item.value.includes(term) ||
                                            item.label
                                                .toLowerCase()
                                                .includes(term)
                                        );
                                    });
                                response(data);
                            },
                            minLength: 0,
                        })
                        .autocomplete('instance')._renderItem = function (
                        ul,
                        item
                    ) {
                        return $('<li>')
                            .append(
                                `<div>${item.label}<p class="sublabel">${item.value}</p></div>`
                            )
                            .appendTo(ul);
                    };
                });
            },
        };

        if (methods[method]) {
            return methods[method].apply(
                this,
                Array.prototype.slice.call(arguments, 1)
            );
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error(
                `Method "${method}" does not exist in haAutocomplete plugin!`
            );
        }
    };

    $.fn.haAutocomplete.defaults = {
        serverId: '#node-input-server',
        type: 'entities',
    };

    $.fn.haAutocomplete.settings = {};
    // eslint-disable-next-line no-undef
})(jQuery);
