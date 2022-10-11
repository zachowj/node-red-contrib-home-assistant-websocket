import { defineClientConfig } from '@vuepress/client';

export default defineClientConfig({
    enhance({ app, router, siteData }) {
        router.addRoute({
            path: '/cookbook/get-entities.html',
            redirect: '/node/get-entities.html',
        });
    },
});
