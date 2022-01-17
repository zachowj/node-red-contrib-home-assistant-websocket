export const getNormalizedDomainServices = () => {
    const domain = $('#node-input-domain').val() as string;
    const service = $('#node-input-service').val() as string;

    return [domain.toLowerCase(), service.toLowerCase()];
};

// Helper function to create a autocomplete list
export const autocompleteSetup = (
    ele: JQuery,
    source: string[],
    cb: () => void
) => {
    ele.autocomplete({
        source: source,
        minLength: 0,
        change: cb,
    }).on('focus', function () {
        // Show search if text field is empty
        const $this = $(this);
        if (($this.val() as string).length === 0) {
            $this.autocomplete('search');
        }
    });
};
