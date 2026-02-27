<script setup lang="ts">
const { createChat, addMessage, getMockResponse } = useChats()

const input = ref('')
const isSubmitting = ref(false)

const suggestions = [
  {
    icon: 'i-lucide-code',
    label: 'Write a Vue composable',
  },
  {
    icon: 'i-lucide-lightbulb',
    label: 'Brainstorm project ideas',
  },
  {
    icon: 'i-lucide-book-open',
    label: 'Explain a concept',
  },
  {
    icon: 'i-lucide-bug',
    label: 'Debug my code',
  },
  {
    icon: 'i-lucide-pen-tool',
    label: 'Draft documentation',
  },
  {
    icon: 'i-lucide-git-branch',
    label: 'Review my PR',
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

async function handleSuggestion(label: string) {
  input.value = label
  await handleSubmit()
}
</script>

<template>
  <UDashboardPanel
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <div class="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <UContainer class="flex flex-col items-center gap-6 max-w-2xl w-full">
          <!-- Greeting -->
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-center animate-fade-in">
            How can I help you today?
          </h1>

          <!-- Chat prompt — centered on this page -->
          <UChatPrompt
            v-model="input"
            variant="subtle"
            placeholder="Message OpenChat..."
            autofocus
            class="w-full [view-transition-name:chat-prompt] animate-fade-in-delayed"
            :ui="{ base: 'px-1.5' }"
            @submit="handleSubmit"
          >
            <template #footer>
              <div class="flex items-center gap-1">
                <ModelSelect />
              </div>

              <UChatPromptSubmit
                :status="isSubmitting ? 'submitted' : 'ready'"
                color="neutral"
                size="sm"
              />
            </template>
          </UChatPrompt>

          <!-- Quick suggestions as inline buttons -->
          <div class="flex flex-wrap justify-center gap-2 animate-fade-in-delayed">
            <UButton
              v-for="suggestion in suggestions"
              :key="suggestion.label"
              :icon="suggestion.icon"
              :label="suggestion.label"
              color="neutral"
              variant="outline"
              size="sm"
              class="rounded-full"
              @click="handleSuggestion(suggestion.label)"
            />
          </div>
        </UContainer>
      </div>
    </template>
  </UDashboardPanel>
</template>
