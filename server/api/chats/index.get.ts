import { and, desc, eq, isNull } from 'drizzle-orm'
import { chats } from '../../database/schema'
import { auth } from '../../utils/auth'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return db
    .select({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
    })
    .from(chats)
    .where(and(eq(chats.userId, session.user.id), isNull(chats.deletedAt)))
    .orderBy(desc(chats.updatedAt))
})
