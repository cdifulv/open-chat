<script setup lang="ts">
const route = useRoute()
const { getChatById, addMessage, getMockResponse, activeChatId } = useChats()

const chatId = computed(() => route.params.id as string)
const chat = computed(() => getChatById(chatId.value))

const input = ref('')
const status = ref<'ready' | 'submitted' | 'streaming'>('ready')

watchEffect(() => {
  activeChatId.value = chatId.value
})

watch(chatId, () => {
  status.value = 'ready'
})

async function handleSubmit() {
  if (!input.value.trim() || status.value !== 'ready') return

  const text = input.value.trim()
  input.value = ''
  status.value = 'submitted'

  addMessage(chatId.value, 'user', text)

  setTimeout(() => {
    status.value = 'streaming'
  }, 600)

  setTimeout(() => {
    addMessage(chatId.value, 'assistant', getMockResponse(text))
    status.value = 'ready'
  }, 1500)
}

function copyMessage(text: string) {
  navigator.clipboard.writeText(text)
  const toast = useToast()
  toast.add({ title: 'Copied to clipboard', icon: 'i-lucide-check', color: 'success' })
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="flex items-center gap-2 min-w-0">
            <UIcon name="i-lucide-message-square" class="size-4 text-(--ui-text-dimmed) shrink-0" />
            <span class="truncate text-sm font-medium">{{ chat?.title || 'Chat' }}</span>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="max-w-3xl h-full">
        <UChatMessages
          v-if="chat"
          :messages="(chat.messages as any)"
          :status="status"
          should-auto-scroll
          :user="{
            variant: 'soft',
            side: 'right',
            avatar: { icon: 'i-lucide-user' },
            actions: []
          }"
          :assistant="{
            variant: 'naked',
            side: 'left',
            icon: 'i-lucide-sparkles',
            actions: []
          }"
        >
          <template #content="{ message }">
            <template v-for="(part, index) in message.parts" :key="`${message.id}-${index}`">
              <p v-if="part.type === 'text'" class="whitespace-pre-wrap leading-relaxed">{{ part.text }}</p>
            </template>
          </template>

          <template #actions="{ message }">
            <div class="flex items-center gap-0.5 mt-1">
              <UTooltip text="Copy">
                <UButton
                  icon="i-lucide-copy"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  @click="copyMessage(message.parts?.map((p: any) => p.text).join('') || '')"
                />
              </UTooltip>
            </div>
          </template>

          <template #indicator>
            <div class="flex items-center gap-2 text-(--ui-text-dimmed) text-sm px-1">
              <span class="flex gap-1">
                <span class="size-1.5 rounded-full bg-(--ui-primary) animate-bounce" style="animation-delay: 0ms" />
                <span class="size-1.5 rounded-full bg-(--ui-primary) animate-bounce" style="animation-delay: 150ms" />
                <span class="size-1.5 rounded-full bg-(--ui-primary) animate-bounce" style="animation-delay: 300ms" />
              </span>
              <span>Thinking...</span>
            </div>
          </template>
        </UChatMessages>

        <div v-else class="flex flex-col items-center justify-center h-full gap-4">
          <UIcon name="i-lucide-message-square-off" class="size-12 text-(--ui-text-dimmed)" />
          <p class="text-(--ui-text-muted)">Chat not found</p>
          <UButton label="Start a new chat" to="/" color="primary" variant="soft" />
        </div>
      </UContainer>
    </template>

    <template #footer>
      <UContainer class="pb-4 sm:pb-6 max-w-3xl">
        <UChatPrompt
          v-model="input"
          variant="outline"
          placeholder="Message OpenChat..."
          :disabled="!chat"
          @submit="handleSubmit"
        >
          <UChatPromptSubmit :status="status" />
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
