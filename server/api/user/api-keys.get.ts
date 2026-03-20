import { eq } from 'drizzle-orm'
import { apiKeys } from '../../database/schema'
import { auth } from '../../utils/auth'
import { decrypt } from '../../utils/crypto'
import { db } from '../../utils/db'

function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return `${key.slice(0, 5)}...${key.slice(-4)}`
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const keys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id))

  return keys.map((key) => ({
    provider: key.provider,
    maskedKey: maskKey(decrypt(key.encryptedKey)),
    updatedAt: key.updatedAt,
  }))
})
