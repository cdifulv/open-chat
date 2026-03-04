export interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ChatGroup {
  label: string
  chats: Chat[]
}

export function useChats() {
  const chats = useState<Chat[]>('chats', () => [])
  const activeChatId = useState<string | null>('active-chat', () => null)

  async function refreshChats() {
    chats.value = await $fetch<Chat[]>('/api/chats')
  }

  async function createChat(title?: string): Promise<Chat> {
    const chat = await $fetch<Chat>('/api/chats', {
      method: 'POST',
      body: { title: title || 'New conversation' },
    })
    chats.value.unshift(chat)
    activeChatId.value = chat.id
    return chat
  }

  async function deleteChat(id: string): Promise<Chat | undefined> {
    const deleted = chats.value.find((c) => c.id === id)
    chats.value = chats.value.filter((c) => c.id !== id)
    if (activeChatId.value === id) {
      activeChatId.value = null
    }
    await $fetch(`/api/chats/${id}`, { method: 'DELETE' })
    return deleted
  }

  async function restoreChat(chat: Chat) {
    const restored = await $fetch<Chat>(`/api/chats/${chat.id}/restore`, { method: 'POST' })
    chats.value.unshift(restored)
    chats.value.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const groupedChats = computed<ChatGroup[]>(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86_400_000)
    const weekAgo = new Date(today.getTime() - 7 * 86_400_000)
    const monthAgo = new Date(today.getTime() - 30 * 86_400_000)

    const groups: ChatGroup[] = [
      { label: 'Today', chats: [] },
      { label: 'Yesterday', chats: [] },
      { label: 'Previous 7 days', chats: [] },
      { label: 'Previous 30 days', chats: [] },
      { label: 'Older', chats: [] },
    ]

    for (const chat of chats.value) {
      const date = new Date(chat.updatedAt)
      if (date >= today) groups[0]!.chats.push(chat)
      else if (date >= yesterday) groups[1]!.chats.push(chat)
      else if (date >= weekAgo) groups[2]!.chats.push(chat)
      else if (date >= monthAgo) groups[3]!.chats.push(chat)
      else groups[4]!.chats.push(chat)
    }

    return groups.filter((g) => g.chats.length > 0)
  })

  return {
    chats,
    activeChatId,
    groupedChats,
    refreshChats,
    createChat,
    deleteChat,
    restoreChat,
  }
}
