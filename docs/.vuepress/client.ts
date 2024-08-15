import { defineClientConfig } from '@vuepress/client';

const redirectRoutes = [
    {
        from: '/cookbook/get-entities.html',
        to: '/node/get-entities.html',
    },
    {
        from: '/guide/custom_integration/switch.html',
        to: '/node/switch.html',
    },
    {
        from: '/node/call-service.html',
        to: '/node/action.html',
    },
    {
        from: '/guide/call-service.html',
        to: '/guide/action.html',
    },
    {
        from: '/cookbook/jsonata/call-service.html',
        to: '/cookbook/jsonata/action.html',
    },
];

export default defineClientConfig({
    enhance({ router }) {
        redirectRoutes.forEach((route) => {
            router.addRoute({
                path: route.from,
                redirect: route.to,
            });
        });
    },
});
