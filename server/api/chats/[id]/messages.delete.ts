import { and, eq, gte } from 'drizzle-orm'
import { chats, messages } from '../../../database/schema'
import { auth } from '../../../utils/auth'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const chatId = getRouterParam(event, 'id')!
  const { messageId } = await readBody<{ messageId: string }>(event)

  if (!messageId) {
    throw createError({ statusCode: 400, message: 'messageId is required' })
  }

  // Verify chat ownership
  const [chat] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
    .limit(1)

  if (!chat) {
    throw createError({ statusCode: 404, message: 'Chat not found' })
  }

  // Find the target message to get its createdAt
  const [targetMessage] = await db
    .select({ createdAt: messages.createdAt })
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.chatId, chatId)))
    .limit(1)

  if (!targetMessage) {
    throw createError({ statusCode: 404, message: 'Message not found' })
  }

  // Delete the target message and all subsequent messages
  await db
    .delete(messages)
    .where(and(
      eq(messages.chatId, chatId),
      gte(messages.createdAt, targetMessage.createdAt),
    ))

  return { success: true }
})
