import { eq } from 'drizzle-orm'
import { apiKeys } from '../../database/schema'
import { auth } from '../../utils/auth'
import { db } from '../../utils/db'

interface ProviderModel {
  label: string
  value: string
  icon: string
  provider: string
}

const freeModels: ProviderModel[] = [
  { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini', icon: 'i-simple-icons-openai', provider: 'openai' },
  { label: 'Claude 3.5 Haiku', value: 'anthropic/claude-3-5-haiku-20241022', icon: 'i-simple-icons-anthropic', provider: 'anthropic' },
  { label: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash', icon: 'i-simple-icons-google', provider: 'google' },
  { label: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash', icon: 'i-simple-icons-google', provider: 'google' },
  { label: 'Gemini 2.0 Flash Lite', value: 'google/gemini-2.0-flash-lite', icon: 'i-simple-icons-google', provider: 'google' },
  { label: 'Gemini 1.5 Flash', value: 'google/gemini-1.5-flash', icon: 'i-simple-icons-google', provider: 'google' },
  { label: 'Gemini 1.5 Flash 8B', value: 'google/gemini-1.5-flash-8b', icon: 'i-simple-icons-google', provider: 'google' },
]

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const keys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id))

  const configuredProviders = new Set(keys.map(k => k.provider))

  return freeModels.filter(m => configuredProviders.has(m.provider))
})
