import { eq, and } from 'drizzle-orm'
import { chats } from '../../../database/schema'
import { auth } from '../../../utils/auth'
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const chatId = getRouterParam(event, 'id')!

  await db
    .update(chats)
    .set({ deletedAt: new Date() })
    .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))

  return { success: true }
})
