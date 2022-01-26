export const getNormalizedDomainServices = () => {
    const domain = $('#domain').val() as string;
    const service = $('#service').val() as string;

    return [domain?.toLowerCase(), service?.toLowerCase()];
};
