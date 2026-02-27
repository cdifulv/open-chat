<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const props = defineProps<{
  collapsed?: boolean
}>()

const { data: session } = await authClient.useSession(useFetch)

const userName = computed(() => session.value?.user?.name || 'User')
const userEmail = computed(() => session.value?.user?.email || '')
const userImage = computed(() => session.value?.user?.image || '')
const userInitials = computed(() => {
  const name = userName.value
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

async function signOut() {
  await authClient.signOut()
  await navigateTo('/login')
}

const items = computed(() => [
  [
    {
      label: userName.value,
      description: userEmail.value,
      type: 'label' as const
    }
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: signOut
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end' as const, side: 'top' as const }"
    :ui="{ content: props.collapsed ? 'w-56' : 'w-(--reka-dashboard-sidebar-width)' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      :square="props.collapsed"
      class="w-full group"
      :class="!props.collapsed && 'justify-start'"
    >
      <UAvatar
        v-if="userImage"
        :src="userImage"
        :alt="userName"
        size="2xs"
      />
      <span
        v-else
        class="size-6 rounded-full bg-(--ui-primary)/10 text-(--ui-primary) flex items-center justify-center text-xs font-semibold shrink-0"
      >
        {{ userInitials }}
      </span>

      <template v-if="!props.collapsed">
        <span class="truncate text-sm font-medium">{{ userName }}</span>
        <UIcon
          name="i-lucide-chevrons-up-down"
          class="size-4 text-(--ui-text-dimmed) ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </template>
    </UButton>
  </UDropdownMenu>
</template>
