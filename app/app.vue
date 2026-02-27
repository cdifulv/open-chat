<script setup>
const colorMode = useColorMode()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: computed(() => colorMode.value === 'dark' ? '#1c1917' : '#ffffff') }
  ],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'OpenChat',
  description: 'A beautifully crafted AI chat interface powered by Nuxt UI.'
})
</script>

<template>
  <UApp
    :toaster="{ position: 'bottom-right', expand: false }"
    :tooltip="{ delayDuration: 300, disableClosingTrigger: true }"
  >
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UToast />
  </UApp>
</template>
