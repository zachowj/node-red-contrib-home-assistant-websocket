import { defineClientAppEnhance } from '@vuepress/client';

export default defineClientAppEnhance(({ app, router, siteData }) => {
    router.addRoute({
        path: '/cookbook/get-entities.html',
        redirect: '/node/get-entities.html',
    });
});
