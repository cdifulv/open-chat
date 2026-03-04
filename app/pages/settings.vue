<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const toast = useToast()
const { refresh: refreshModels } = useModels()
const { data: session } = await authClient.useSession(useFetch)

const name = ref(session.value?.user?.name || '')
const profileLoading = ref(false)

async function updateProfile() {
  if (!name.value.trim()) return

  profileLoading.value = true
  try {
    await $fetch('/api/user/update-profile', {
      method: 'POST',
      body: { name: name.value.trim() },
    })
    toast.add({ title: 'Profile updated', color: 'success' })
  }
  catch {
    toast.add({ title: 'Failed to update profile', color: 'error' })
  }
  finally {
    profileLoading.value = false
  }
}

const providers = [
  { id: 'openai', name: 'OpenAI', icon: 'i-simple-icons-openai' },
  { id: 'anthropic', name: 'Anthropic', icon: 'i-simple-icons-anthropic' },
  { id: 'google', name: 'Google', icon: 'i-simple-icons-google' },
] as const

type ProviderId = typeof providers[number]['id']
type ProviderKeyState = { maskedKey: string, input: string, loading: boolean }

const providerKeys = ref(
  Object.fromEntries(providers.map((p) => [p.id, { maskedKey: '', input: '', loading: false }])) as Record<ProviderId, ProviderKeyState>,
)

async function fetchApiKeys() {
  try {
    const keys = await $fetch<{ provider: string, maskedKey: string }[]>('/api/user/api-keys')
    for (const key of keys) {
      const pk = providerKeys.value[key.provider as ProviderId]
      if (pk) {
        pk.maskedKey = key.maskedKey
      }
    }
  }
  catch {
    // Silently fail — keys just won't show as configured
  }
}

async function saveApiKey(providerId: ProviderId) {
  const pk = providerKeys.value[providerId]
  if (!pk || !pk.input.trim()) return

  pk.loading = true
  try {
    await $fetch('/api/user/api-keys', {
      method: 'POST',
      body: { provider: providerId, key: pk.input.trim() },
    })
    pk.input = ''
    toast.add({ title: 'API key saved', color: 'success' })
    await fetchApiKeys()
    await refreshModels()
  }
  catch {
    toast.add({ title: 'Failed to save API key', color: 'error' })
  }
  finally {
    pk.loading = false
  }
}

async function deleteApiKey(providerId: ProviderId) {
  const pk = providerKeys.value[providerId]
  if (!pk) return

  pk.loading = true
  try {
    await $fetch('/api/user/api-keys', {
      method: 'DELETE',
      body: { provider: providerId },
    })
    pk.maskedKey = ''
    pk.input = ''
    toast.add({ title: 'API key removed', color: 'success' })
    await refreshModels()
  }
  catch {
    toast.add({ title: 'Failed to remove API key', color: 'error' })
  }
  finally {
    pk.loading = false
  }
}

await fetchApiKeys()
</script>

<template>
  <UDashboardPanel :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <div class="flex flex-1 flex-col items-center px-4 sm:px-6 py-8">
        <div class="w-full max-w-xl flex flex-col gap-8">
          <h1 class="text-2xl font-bold tracking-tight">Settings</h1>

          <!-- Profile Section -->
          <div class="flex flex-col gap-4">
            <h2 class="text-lg font-semibold">Profile</h2>
            <UCard>
              <form class="flex flex-col gap-4" @submit.prevent="updateProfile">
                <UFormField label="Name">
                  <UInput v-model="name" placeholder="Your name" class="w-full" />
                </UFormField>
                <div class="flex justify-end">
                  <UButton type="submit" label="Save" :loading="profileLoading" />
                </div>
              </form>
            </UCard>
          </div>

          <!-- API Keys Section -->
          <div class="flex flex-col gap-4">
            <div>
              <h2 class="text-lg font-semibold">API Keys</h2>
              <p class="text-sm text-(--ui-text-muted) mt-1">
                Add your own API keys to use with each provider. Keys are encrypted at rest.
              </p>
            </div>

            <div class="flex flex-col gap-3">
              <UCard v-for="provider in providers" :key="provider.id">
                <div class="flex flex-col gap-3">
                  <div class="flex items-center gap-2">
                    <UIcon :name="provider.icon" class="size-5 shrink-0" />
                    <span class="font-medium">{{ provider.name }}</span>
                    <UBadge
                      v-if="providerKeys[provider.id].maskedKey"
                      label="Configured"
                      color="success"
                      variant="subtle"
                      size="xs"
                      class="ml-auto"
                    />
                  </div>

                  <p
                    v-if="providerKeys[provider.id].maskedKey"
                    class="text-sm text-(--ui-text-dimmed) font-mono"
                  >
                    {{ providerKeys[provider.id].maskedKey }}
                  </p>

                  <div class="flex gap-2">
                    <UInput
                      v-model="providerKeys[provider.id].input"
                      type="password"
                      :placeholder="providerKeys[provider.id].maskedKey ? 'Enter new key to update...' : 'Enter API key...'"
                      class="flex-1"
                    />
                    <UButton
                      label="Save"
                      :loading="providerKeys[provider.id].loading"
                      :disabled="!providerKeys[provider.id].input.trim()"
                      @click="saveApiKey(provider.id)"
                    />
                    <UButton
                      v-if="providerKeys[provider.id].maskedKey"
                      label="Delete"
                      color="error"
                      variant="soft"
                      :loading="providerKeys[provider.id].loading"
                      @click="deleteApiKey(provider.id)"
                    />
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
