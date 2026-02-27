<script setup lang="ts">
const { createChat, addMessage, getMockResponse } = useChats()

const input = ref('')
const isSubmitting = ref(false)

const suggestions = [
  {
    icon: 'i-lucide-code',
    title: 'Write code',
    description: 'Help me build a REST API with authentication'
  },
  {
    icon: 'i-lucide-lightbulb',
    title: 'Brainstorm ideas',
    description: 'Generate creative solutions for my project'
  },
  {
    icon: 'i-lucide-book-open',
    title: 'Explain a concept',
    description: 'Break down complex topics into simple terms'
  },
  {
    icon: 'i-lucide-bug',
    title: 'Debug an issue',
    description: 'Help me find and fix bugs in my code'
  }
]

async function handleSubmit() {
  if (!input.value.trim() || isSubmitting.value) return

  isSubmitting.value = true
  const text = input.value.trim()
  input.value = ''

  const chat = createChat(text)
  addMessage(chat.id, 'user', text)

  await navigateTo(`/chat/${chat.id}`)

  setTimeout(() => {
    addMessage(chat.id, 'assistant', getMockResponse(text))
    isSubmitting.value = false
  }, 1200)
}

async function handleSuggestion(suggestion: typeof suggestions[number]) {
  input.value = suggestion.description
  await handleSubmit()
}
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full px-4">
        <div class="flex flex-col items-center gap-3 mb-12 animate-fade-in">
          <div class="relative">
            <div class="size-16 rounded-2xl bg-(--ui-primary)/10 flex items-center justify-center">
              <UIcon name="i-lucide-sparkles" class="size-8 text-(--ui-primary)" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-(--ui-primary)/5 blur-xl scale-150" />
          </div>

          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-(--ui-text)">
            What can I help you with?
          </h1>
          <p class="text-(--ui-text-muted) text-base max-w-md text-center leading-relaxed">
            Ask me anything — from writing code to explaining complex ideas. I'm here to help.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-8 animate-fade-in-delayed">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.title"
            class="group flex items-start gap-3 p-4 rounded-xl border border-(--ui-border) bg-(--ui-bg)/50 hover:bg-(--ui-bg-elevated) hover:border-(--ui-primary)/30 transition-all duration-200 text-left cursor-pointer"
            @click="handleSuggestion(suggestion)"
          >
            <div class="size-9 rounded-lg bg-(--ui-primary)/10 flex items-center justify-center shrink-0 group-hover:bg-(--ui-primary)/15 transition-colors">
              <UIcon :name="suggestion.icon" class="size-4.5 text-(--ui-primary)" />
            </div>
            <div class="flex flex-col gap-0.5 min-w-0">
              <span class="text-sm font-medium text-(--ui-text) group-hover:text-(--ui-primary) transition-colors">
                {{ suggestion.title }}
              </span>
              <span class="text-xs text-(--ui-text-dimmed) leading-relaxed truncate">
                {{ suggestion.description }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </template>

    <template #footer>
      <UContainer class="pb-4 sm:pb-6 max-w-3xl">
        <UChatPrompt
          v-model="input"
          variant="outline"
          placeholder="Message OpenChat..."
          @submit="handleSubmit"
        >
          <UChatPromptSubmit
            :status="isSubmitting ? 'submitted' : 'ready'"
          />
        </UChatPrompt>

        <p class="text-center text-xs text-(--ui-text-dimmed) mt-3">
          OpenChat is a frontend demo. Responses are simulated.
        </p>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
