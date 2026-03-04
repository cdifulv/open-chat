import { and, eq } from 'drizzle-orm'
import { apiKeys } from '../../database/schema'
import { auth } from '../../utils/auth'
import { encrypt } from '../../utils/crypto'
import { db } from '../../utils/db'

const VALID_PROVIDERS = ['openai', 'anthropic', 'google']

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ provider: string, key: string }>(event)

  if (!body.provider || !VALID_PROVIDERS.includes(body.provider)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid provider' })
  }

  if (!body.key?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'API key is required' })
  }

  const encryptedKey = encrypt(body.key.trim())

  const existing = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, session.user.id), eq(apiKeys.provider, body.provider)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(apiKeys)
      .set({ encryptedKey })
      .where(eq(apiKeys.id, existing[0]!.id))
  }
  else {
    await db.insert(apiKeys).values({
      userId: session.user.id,
      provider: body.provider,
      encryptedKey,
    })
  }

  return { success: true }
})
