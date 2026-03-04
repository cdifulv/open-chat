import { asc, eq } from 'drizzle-orm'
import { chats, messages } from '../../database/schema'
import { auth } from '../../utils/auth'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const chatId = getRouterParam(event, 'id')!

  const [chat] = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1)

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  if (chat.userId !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt))

  return {
    ...chat,
    messages: chatMessages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.parts,
    })),
  }
})
