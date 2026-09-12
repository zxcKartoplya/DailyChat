<script setup lang="ts">
const { preference } = useTheme()

useHead({
  htmlAttrs: {
    'data-theme': computed(() => (preference.value === 'system' ? undefined : preference.value))
  },
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
