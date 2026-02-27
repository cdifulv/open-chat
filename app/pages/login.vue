<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

definePageMeta({
  layout: false,
})

const email = ref('')
const magicLinkSent = ref(false)
const magicLinkLoading = ref(false)
const magicLinkError = ref('')

async function signInWithGoogle() {
  await authClient.signIn.social({ provider: 'google' })
}

async function sendMagicLink() {
  if (!email.value.trim()) return

  magicLinkLoading.value = true
  magicLinkError.value = ''

  const { error } = await authClient.signIn.magicLink({ email: email.value })

  magicLinkLoading.value = false

  if (error) {
    magicLinkError.value = error.message ?? 'Something went wrong'
    return
  }

  magicLinkSent.value = true
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-(--ui-bg) px-4">
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center gap-2 mb-8">
        <div class="size-12 rounded-xl bg-(--ui-primary)/10 flex items-center justify-center">
          <UIcon name="i-lucide-sparkles" class="size-6 text-(--ui-primary)" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-(--ui-text)">
          Sign in to OpenChat
        </h1>
        <p class="text-sm text-(--ui-text-muted)">
          Choose your preferred sign-in method
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <UButton
          icon="i-simple-icons-google"
          label="Sign in with Google"
          color="neutral"
          variant="outline"
          size="lg"
          block
          @click="signInWithGoogle"
        />

        <USeparator label="or" />

        <template v-if="!magicLinkSent">
          <form class="flex flex-col gap-3" @submit.prevent="sendMagicLink">
            <UInput
              v-model="email"
              type="email"
              placeholder="Enter your email"
              size="lg"
              required
            />
            <UButton
              type="submit"
              label="Send magic link"
              size="lg"
              block
              :loading="magicLinkLoading"
            />
          </form>
          <p v-if="magicLinkError" class="text-sm text-(--ui-error)">
            {{ magicLinkError }}
          </p>
        </template>

        <div v-else class="rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-4 text-center">
          <UIcon name="i-lucide-mail-check" class="size-8 text-(--ui-primary) mb-2" />
          <p class="text-sm font-medium text-(--ui-text)">
            Check your email
          </p>
          <p class="text-xs text-(--ui-text-muted) mt-1">
            We sent a magic link to <strong>{{ email }}</strong>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
