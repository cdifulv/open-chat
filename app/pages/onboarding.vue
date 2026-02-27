<script setup lang="ts">
definePageMeta({
  layout: false,
})

const name = ref('')
const loading = ref(false)
const error = ref('')

async function completeOnboarding() {
  if (!name.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/user/complete-onboarding', {
      method: 'POST',
      body: { name: name.value },
    })
    window.location.href = '/'
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err.data?.message ?? 'Something went wrong'
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-(--ui-bg) px-4">
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center gap-2 mb-8">
        <div class="size-12 rounded-xl bg-(--ui-primary)/10 flex items-center justify-center">
          <UIcon name="i-lucide-user" class="size-6 text-(--ui-primary)" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-(--ui-text)">
          Welcome to OpenChat
        </h1>
        <p class="text-sm text-(--ui-text-muted)">
          Tell us your name to get started
        </p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="completeOnboarding">
        <UInput
          v-model="name"
          placeholder="Your name"
          size="lg"
          required
        />
        <UButton
          type="submit"
          label="Continue"
          size="lg"
          block
          :loading="loading"
        />
        <p v-if="error" class="text-sm text-(--ui-error)">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>
