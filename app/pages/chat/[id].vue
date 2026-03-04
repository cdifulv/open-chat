<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { TextStreamChatTransport, type UIMessage } from 'ai'

const route = useRoute()
const { activeChatId, refreshChats } = useChats()
const { model } = useModels()

const chatId = computed(() => route.params.id as string)

const copied = ref(false)
const initialLoaded = ref(false)

watchEffect(() => {
  activeChatId.value = chatId.value
})

function createChat(id: string) {
  return new Chat({
    transport: new TextStreamChatTransport({
      api: `/api/chats/${id}`,
      body: () => ({ model: model.value }),
    }),
    onFinish: () => {
      refreshChats()
    },
  })
}

const chat = shallowRef(createChat(chatId.value))

const messages = computed(() => chat.value.messages)
const input = ref('')
const chatStatus = computed(() => chat.value.status)

function handleSubmit() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  chat.value.sendMessage({ text })
}

// Load existing messages when navigating to a chat
watch(
  chatId,
  async (id) => {
    initialLoaded.value = false
    chat.value = createChat(id)
    try {
      const data = await $fetch<{ messages: Array<{ id: string; role: string; parts: Array<{ type: string; text?: string }> }> }>(`/api/chats/${id}`)
      chat.value.messages = data.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        parts: m.parts,
      })) as UIMessage[]
    }
    catch {
      chat.value.messages = []
    }
    initialLoaded.value = true
  },
  { immediate: true },
)

// Handle initial message from query param (when creating from home page)
const initialMessage = useState<string | null>('initial-message', () => null)
watch(initialLoaded, (loaded) => {
  if (loaded && initialMessage.value && chat.value.messages.length === 0) {
    input.value = initialMessage.value
    initialMessage.value = null
    nextTick(() => {
      handleSubmit()
    })
  }
})

function copyMessage(e: MouseEvent, message: { id: string; parts?: Array<{ type: string; text?: string }> }) {
  const text = message.parts?.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('') || ''
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
          v-if="initialLoaded"
          :messages="(messages as any)"
          :status="chatStatus"
          should-auto-scroll
          :assistant="chatStatus !== 'streaming'
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

        <!-- Chat prompt — sticky at bottom -->
        <UChatPrompt
          v-model="input"
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
              :status="chatStatus"
              color="neutral"
              size="sm"
              @stop="chat.stop()"
            />
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
