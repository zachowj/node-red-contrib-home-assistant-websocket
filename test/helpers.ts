export const resetStubInterface = (stub: any) => {
    for (const method in stub) {
        if (method !== 'constructor') {
            (stub as any)[method].reset();
        }
    }
};
