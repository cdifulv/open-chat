import { and, eq } from 'drizzle-orm'
import { apiKeys } from '../../database/schema'
import { auth } from '../../utils/auth'
import { db } from '../../utils/db'

const VALID_PROVIDERS = ['openai', 'anthropic', 'google']

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ provider: string }>(event)

  if (!body.provider || !VALID_PROVIDERS.includes(body.provider)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid provider' })
  }

  await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.userId, session.user.id), eq(apiKeys.provider, body.provider)))

  return { success: true }
})
