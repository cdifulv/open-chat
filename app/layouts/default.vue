<script setup lang="ts">
import { authClient } from '~/utils/auth-client';

const route = useRoute();
const toast = useToast();

const { data: session } = await authClient.useSession(useFetch);
const loggedIn = computed(() => !!session.value);

const open = ref(false);
const { groupedChats, deleteChat } = useChats();

async function handleDeleteChat(id: string) {
  deleteChat(id);

  toast.add({
    title: 'Chat deleted',
    icon: 'i-lucide-trash',
    color: 'neutral'
  });

  if (route.params.id === id) {
    await navigateTo('/');
  }
}

// Navigation menu items for sidebar (flat list with labels + chat items)
const navItems = computed(() =>
  groupedChats.value?.flatMap((group) => {
    return [
      {
        label: group.label,
        type: 'label' as const
      },
      ...group.chats.map((chat) => ({
        id: chat.id,
        label: chat.title,
        to: `/chat/${chat.id}`,
        slot: 'chat' as const,
        class: chat.title === 'Untitled' ? 'text-muted' : ''
      }))
    ];
  })
);

// Search groups for UDashboardSearch
const searchGroups = computed(() => [
  {
    id: 'links',
    items: [
      {
        label: 'New chat',
        to: '/',
        icon: 'i-lucide-square-pen'
      }
    ]
  },
  ...groupedChats.value.map((group) => ({
    id: group.label,
    label: group.label,
    items: group.chats.map((chat) => ({
      label: chat.title,
      to: `/chat/${chat.id}`,
      icon: 'i-lucide-message-circle'
    }))
  }))
]);

defineShortcuts({
  c: () => navigateTo('/')
});
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      :min-size="12"
      collapsible
      resizable
      class="border-r-0 py-4"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="flex items-end gap-0.5">
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--ui-primary)/10"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="size-4.5 text-(--ui-primary)"
            />
          </div>
          <span v-if="!collapsed" class="text-highlighted text-xl font-bold"
            >Chat</span
          >
        </NuxtLink>

        <div v-if="!collapsed" class="ms-auto flex items-center gap-1.5">
          <UDashboardSearchButton collapsed />
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col gap-1.5">
          <UButton
            v-bind="
              collapsed ? { icon: 'i-lucide-plus' } : { label: 'New chat' }
            "
            variant="soft"
            block
            to="/"
            @click="open = false"
          />

          <template v-if="collapsed">
            <UDashboardSearchButton collapsed />
          </template>
        </div>

        <UNavigationMenu
          v-if="!collapsed"
          :items="navItems"
          :collapsed="collapsed"
          orientation="vertical"
          :ui="{ link: 'overflow-hidden' }"
        >
          <template #chat-trailing="{ item }">
            <div
              class="-mr-1.25 flex translate-x-full transition-transform group-hover:translate-x-0"
            >
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                class="text-muted hover:text-primary hover:bg-accented/50 focus-visible:bg-accented/50 p-0.5"
                tabindex="-1"
                @click.stop.prevent="handleDeleteChat((item as any).id)"
              />
            </div>
          </template>
        </UNavigationMenu>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu v-if="loggedIn" :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch placeholder="Search chats..." :groups="searchGroups" />

    <div
      class="ring-default bg-default/75 m-4 flex min-w-0 flex-1 rounded-lg shadow ring lg:ml-0"
    >
      <slot />
    </div>
  </UDashboardGroup>
</template>
