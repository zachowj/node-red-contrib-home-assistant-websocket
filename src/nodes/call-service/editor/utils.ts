export const getNormalizedDomainServices = () => {
    const domain = $('#node-input-domain').val() as string;
    const service = $('#node-input-service').val() as string;

    return [domain?.toLowerCase(), service?.toLowerCase()];
};
