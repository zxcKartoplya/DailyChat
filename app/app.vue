<script setup lang="ts">
const { preference } = useTheme()

useHead({
  htmlAttrs: computed(() => (preference.value === 'system' ? {} : { 'data-theme': preference.value })),
  titleTemplate: title => (title ? `${title} — Дейлик` : 'Дейлик')
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
