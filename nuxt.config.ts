// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app:{
    head:{
      title: 'Campfire',
      htmlAttrs:{
        lang:'en',
      },
      link: [
        {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"]
})
