import { eq, and } from 'drizzle-orm'
import { chats } from '../../database/schema'
import { auth } from '../../utils/auth'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const chatId = getRouterParam(event, 'id')!

  const [chat] = await db
    .update(chats)
    .set({ deletedAt: null })
    .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
    .returning({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
    })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  return chat
})
