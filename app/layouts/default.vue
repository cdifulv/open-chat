<script setup lang="ts">
const route = useRoute();
const { groupedChats, createChat, deleteChat, activeChatId } = useChats();

const renamingChatId = ref<string | null>(null);
const renameInput = ref('');

async function handleNewChat() {
  const chat = createChat();
  await navigateTo(`/chat/${chat.id}`);
}

async function handleDeleteChat(id: string) {
  deleteChat(id);
  if (route.params.id === id) {
    await navigateTo('/');
  }
}

function startRename(chat: { id: string; title: string }) {
  renamingChatId.value = chat.id;
  renameInput.value = chat.title;
}

function confirmRename(chatId: string) {
  const { renameChat } = useChats();
  if (renameInput.value.trim()) {
    renameChat(chatId, renameInput.value.trim());
  }
  renamingChatId.value = null;
}

function getChatMenuItems(chat: { id: string; title: string }) {
  return [
    [
      {
        label: 'Rename',
        icon: 'i-lucide-pencil',
        onSelect: () => startRename(chat)
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-lucide-trash-2',
        color: 'error' as const,
        onSelect: () => handleDeleteChat(chat.id)
      }
    ]
  ];
}
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      collapsible
      resizable
      :min-size="14"
      :default-size="18"
      :max-size="28"
      :ui="{
        root: 'bg-(--ui-bg-elevated)/80 backdrop-blur-xl',
        footer: 'border-t border-(--ui-border)'
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex w-full items-center gap-2">
          <div v-if="!collapsed" class="flex min-w-0 flex-1 items-center gap-2">
            <UIcon
              name="i-lucide-sparkles"
              class="size-5 shrink-0 text-(--ui-primary)"
            />
            <span class="truncate text-sm font-semibold tracking-tight"
              >OpenChat</span
            >
          </div>
          <UIcon
            v-else
            name="i-lucide-sparkles"
            class="mx-auto size-5 text-(--ui-primary)"
          />

          <UTooltip v-if="!collapsed" text="New chat" :delay-duration="300">
            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="soft"
              size="xs"
              square
              @click="handleNewChat"
            />
          </UTooltip>
          <UTooltip
            v-else
            text="New chat"
            :content="{ side: 'right' }"
            :delay-duration="0"
          >
            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="soft"
              size="xs"
              square
              @click="handleNewChat"
            />
          </UTooltip>
        </div>
        .
      </template>

      <template #default="{ collapsed }">
        <div v-if="collapsed" class="flex flex-col items-center gap-1 py-1">
          <UTooltip
            v-for="group in groupedChats"
            :key="group.label"
            :text="group.label"
            :content="{ side: 'right' }"
            :delay-duration="0"
          >
            <template v-for="chat in group.chats.slice(0, 2)" :key="chat.id">
              <UButton
                icon="i-lucide-message-square"
                :color="route.params.id === chat.id ? 'primary' : 'neutral'"
                :variant="route.params.id === chat.id ? 'soft' : 'ghost'"
                size="xs"
                square
                :to="`/chat/${chat.id}`"
              />
            </template>
          </UTooltip>
        </div>

        <div v-else class="flex flex-col gap-4 py-1">
          <div
            v-for="group in groupedChats"
            :key="group.label"
            class="flex flex-col gap-0.5"
          >
            <span
              class="px-2.5 py-1.5 text-xs font-medium tracking-wider text-(--ui-text-dimmed) uppercase"
            >
              {{ group.label }}
            </span>

            <div
              v-for="chat in group.chats"
              :key="chat.id"
              class="group relative"
            >
              <div v-if="renamingChatId === chat.id" class="px-1">
                <UInput
                  v-model="renameInput"
                  size="xs"
                  autofocus
                  @keydown.enter="confirmRename(chat.id)"
                  @keydown.escape="renamingChatId = null"
                  @blur="confirmRename(chat.id)"
                />
              </div>

              <NuxtLink
                v-else
                :to="`/chat/${chat.id}`"
                class="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150"
                :class="[
                  route.params.id === chat.id
                    ? 'bg-(--ui-primary)/10 text-(--ui-primary)'
                    : 'text-(--ui-text-muted) hover:bg-(--ui-bg-accented) hover:text-(--ui-text)'
                ]"
                @click="activeChatId = chat.id"
              >
                <span class="flex-1 truncate">{{ chat.title }}</span>

                <UDropdownMenu
                  :items="getChatMenuItems(chat)"
                  :content="{ align: 'start' }"
                >
                  <UButton
                    icon="i-lucide-ellipsis"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    square
                    class="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    @click.prevent
                  />
                </UDropdownMenu>
              </NuxtLink>
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div
          class="flex items-center gap-2"
          :class="collapsed ? 'flex-col' : 'justify-between'"
        >
          <UButton
            :avatar="{ icon: 'i-lucide-user' }"
            :label="collapsed ? undefined : 'You'"
            color="neutral"
            variant="ghost"
            size="sm"
            :square="collapsed"
            class="flex-1"
            :class="!collapsed && 'justify-start'"
          />
          <UColorModeButton
            :size="collapsed ? 'xs' : 'sm'"
            color="neutral"
            variant="ghost"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
