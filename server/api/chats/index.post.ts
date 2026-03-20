import { chats } from '../../database/schema'
import { auth } from '../../utils/auth'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody<{ title?: string }>(event)

  const [chat] = await db.insert(chats).values({
    userId: session.user.id,
    title: body.title || 'New conversation',
  }).returning()

  return chat
})
