import { eq } from 'drizzle-orm'
import { user } from '../../database/schema'
import { auth } from '../../utils/auth'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ name: string }>(event)

  const name = body.name?.trim()

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  await db
    .update(user)
    .set({
      name,
      onboardingCompleted: true,
    })
    .where(eq(user.id, session.user.id))

  return { success: true }
})
