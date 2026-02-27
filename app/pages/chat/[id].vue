<script setup lang="ts">
const route = useRoute()
const { getChatById, addMessage, getMockResponse, activeChatId } = useChats()

const chatId = computed(() => route.params.id as string)
const chat = computed(() => getChatById(chatId.value))

const input = ref('')
const status = ref<'ready' | 'submitted' | 'streaming'>('ready')
const copied = ref(false)

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

function copyMessage(e: MouseEvent, message: { id: string; parts?: { text: string }[] }) {
  const text = message.parts?.map((p) => p.text).join('') || ''
  navigator.clipboard.writeText(text)
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <UDashboardPanel
    id="chat"
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none' }"
  >
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
        <UChatMessages
          v-if="chat"
          :messages="(chat.messages as any)"
          :status="status"
          should-auto-scroll
          :assistant="status !== 'streaming'
            ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copyMessage }] }
            : { actions: [] }"
          :spacing-offset="160"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
        >
          <template #content="{ message }">
            <template
              v-for="(part, index) in message.parts"
              :key="`${message.id}-${index}`"
            >
              <p
                v-if="part.type === 'text'"
                class="whitespace-pre-wrap leading-relaxed"
              >
                {{ part.text }}
              </p>
            </template>
          </template>
        </UChatMessages>

        <!-- Chat not found state -->
        <div
          v-else
          class="flex flex-col items-center justify-center h-full gap-5"
        >
          <UIcon
            name="i-lucide-message-square-off"
            class="size-12 text-muted"
          />
          <p class="text-muted">Chat not found</p>
          <UButton
            label="Start a new chat"
            to="/"
            color="primary"
            variant="soft"
          />
        </div>

        <!-- Chat prompt — sticky at bottom -->
        <UChatPrompt
          v-model="input"
          :disabled="!chat"
          variant="subtle"
          placeholder="Message OpenChat..."
          autofocus
          class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
          :ui="{ base: 'px-1.5' }"
          @submit="handleSubmit"
        >
          <template #footer>
            <div class="flex items-center gap-1">
              <ModelSelect />
            </div>

            <UChatPromptSubmit
              :status="status"
              color="neutral"
              size="sm"
              @stop="status = 'ready'"
            />
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
