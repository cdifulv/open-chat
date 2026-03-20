<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { TextStreamChatTransport, type UIMessage } from 'ai'

const route = useRoute()
const { activeChatId, refreshChats } = useChats()
const { model } = useModels()

const chatId = computed(() => route.params.id as string)

const copied = ref(false)
const initialLoaded = ref(false)
const editingMessageId = ref<string | null>(null)
const editingText = ref('')
const errorExpanded = ref(false)

watchEffect(() => {
  activeChatId.value = chatId.value
})

function createChat(id: string) {
  return new Chat({
    transport: new TextStreamChatTransport({
      api: `/api/chats/${id}`,
      body: () => ({ model: model.value }),
    }),
    onError: (err) => {
      chatError.value = err
    },
    onFinish: () => {
      refreshChats()
    },
  })
}

const chat = shallowRef(createChat(chatId.value))

const displayMessages = computed(() => {
  const msgs = chat.value.messages
  if (!chatError.value) return msgs
  return [...msgs, {
    id: '__error__',
    role: 'assistant' as const,
    parts: [{ type: 'text', text: '' }],
  }]
})
const input = ref('')
const chatStatus = computed(() => chat.value.status)
const chatError = ref<Error>()

function handleSubmit() {
  const text = input.value.trim()
  if (!text) return
  chatError.value = undefined
  errorExpanded.value = false
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

function retryLastMessage() {
  const msgs = chat.value.messages
  const lastUserMsg = [...msgs].reverse().find((m: UIMessage) => m.role === 'user')
  if (!lastUserMsg) return
  const text = getMessageText(lastUserMsg)
  if (!text) return
  chatError.value = undefined
  errorExpanded.value = false
  // Remove the failed assistant message if present
  const lastMsg = msgs[msgs.length - 1]
  if (lastMsg && lastMsg.role === 'assistant') {
    chat.value.messages = msgs.slice(0, -1) as UIMessage[]
  }
  chat.value.sendMessage({ text })
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }) {
  return message.parts?.filter(p => p.type === 'text').map(p => p.text ?? '').join('') || ''
}

function startEditing(_e: MouseEvent, message: { id: string; parts?: Array<{ type: string; text?: string }> }) {
  editingMessageId.value = message.id
  editingText.value = getMessageText(message)
}

function cancelEditing() {
  editingMessageId.value = null
  editingText.value = ''
}

async function saveEdit(messageId: string) {
  const text = editingText.value.trim()
  if (!text) return

  const id = chatId.value
  editingMessageId.value = null
  editingText.value = ''

  // Delete the edited message and all subsequent messages from DB
  await $fetch(`/api/chats/${id}/messages`, {
    method: 'DELETE',
    body: { messageId },
  })

  // Truncate local messages: remove the edited message and everything after it
  const idx = chat.value.messages.findIndex((m: UIMessage) => m.id === messageId)
  if (idx !== -1) {
    chat.value.messages = chat.value.messages.slice(0, idx) as UIMessage[]
  }

  // Send the edited text as a new message
  chat.value.sendMessage({ text })
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
          :messages="(displayMessages as any)"
          :status="chatStatus"
          should-auto-scroll
          :user="chatStatus !== 'streaming'
            ? { actions: [{ label: 'Edit', icon: 'i-lucide-pencil', onClick: startEditing }] }
            : { actions: [] }"
          :assistant="chatStatus !== 'streaming'
            ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copyMessage }] }
            : { actions: [] }"
          :spacing-offset="160"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
        >
          <template #content="{ message }">
            <!-- Error message -->
            <div v-if="message.id === '__error__'" class="flex flex-col gap-2">
              <div class="relative">
                <div
                  class="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-4"
                >
                  <div class="flex items-start gap-3">
                    <UIcon name="i-lucide-circle-alert" class="text-red-500 shrink-0 mt-0.5 size-5" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-red-800 dark:text-red-300">
                        Oops, something went wrong
                      </p>
                      <p
                        v-if="errorExpanded"
                        class="text-sm text-red-600 dark:text-red-400 mt-2 whitespace-pre-wrap break-words"
                      >
                        {{ chatError?.message }}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  class="absolute left-1/2 -translate-x-1/2 -bottom-3 flex items-center justify-center size-6 rounded-md border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/50 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-transform duration-200"
                  @click="errorExpanded = !errorExpanded"
                >
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-3.5 transition-transform duration-200"
                    :class="{ 'rotate-180': errorExpanded }"
                  />
                </button>
              </div>
              <UButton
                size="xs"
                color="red"
                variant="soft"
                label="Try again"
                icon="i-lucide-refresh-cw"
                class="self-end"
                @click="retryLastMessage()"
              />
            </div>
            <!-- Editing mode for user messages -->
            <div v-else-if="editingMessageId === message.id" class="w-full">
              <UTextarea
                v-model="editingText"
                autofocus
                autoresize
                class="w-full min-w-[300px]"
                :ui="{ base: 'min-h-0' }"
                :rows="editingText.split('\n').length || 1"
                @keydown.enter.exact="saveEdit(message.id)"
                @keydown.escape="cancelEditing"
              />
              <div class="flex gap-2 mt-2 justify-end">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  label="Cancel"
                  @click="cancelEditing"
                />
                <UButton
                  size="xs"
                  color="primary"
                  label="Save & Submit"
                  @click="saveEdit(message.id)"
                />
              </div>
            </div>
            <!-- Normal display -->
            <template v-else>
              <template
                v-for="(part, index) in message.parts"
                :key="`${message.id}-${index}`"
              >
                <MDC
                  v-if="part.type === 'text' && message.role === 'assistant'"
                  :value="part.text"
                  :cache-key="`${message.id}-${index}`"
                  class="prose prose-sm dark:prose-invert *:first:mt-0 *:last:mb-0"
                />
                <p
                  v-else-if="part.type === 'text'"
                  class="whitespace-pre-wrap leading-relaxed"
                >
                  {{ part.text }}
                </p>
              </template>
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
