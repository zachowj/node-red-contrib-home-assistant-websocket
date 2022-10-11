import { defineClientConfig } from '@vuepress/client';

export default defineClientConfig({
    enhance({ router }) {
        router.addRoute({
            path: '/cookbook/get-entities.html',
            redirect: '/node/get-entities.html',
        });
        router.addRoute({
            path: '/guide/custom_integration/switch.html',
            redirect: '/node/switch.html',
        });
    },
});
