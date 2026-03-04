<script setup lang="ts">
const { model, models, status } = useModels()
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="models"
    size="sm"
    :icon="models.find(m => m.value === model)?.icon"
    variant="ghost"
    value-key="value"
    :loading="status === 'pending'"
    :disabled="!models.length"
    :placeholder="!models.length && status !== 'pending' ? 'No models available' : 'Select a model'"
    class="data-[state=open]:bg-elevated"
    :content="{ align: 'start', sideOffset: 4, collisionPadding: 8 }"
    :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
      content: 'w-[var(--reka-popper-anchor-width)] min-w-max'
    }"
  />
</template>
