<script lang="ts" setup>
</script>

<template>
  <div class="flex flex-row gap-6 h-screen p-3">
    <UPageCard
      class="h-full max-w-55 items-start"
    >
      <UUser
        name="Kirill Belyaev"
        description="В сети"
        :avatar="{ alt: 'Kirill' }"
        :chip="{ color: 'success' }"
        size="md"
      />
      <UButton
        class="justify-between"
        label="Выйти из аккаунта"
        trailing-icon="i-lucide-log-out"
        size="sm"
      />
    </UPageCard>
    <div class="flex-1 h-full overflow-hidden">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
