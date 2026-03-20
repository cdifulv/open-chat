import { eq } from 'drizzle-orm'
import { apiKeys } from '../../database/schema'
import { auth } from '../../utils/auth'
import { decrypt } from '../../utils/crypto'
import { db } from '../../utils/db'

interface ProviderModel {
  label: string
  value: string
  icon: string
  provider: string
}

async function fetchOpenAIModels(apiKey: string): Promise<ProviderModel[]> {
  const res = await $fetch<{ data: { id: string }[] }>('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  const allowedPrefixes = ['gpt-', 'o1', 'o3', 'o4', 'chatgpt-']
  const excluded = ['realtime', 'audio']

  return res.data
    .filter((m) => {
      const id = m.id.toLowerCase()
      return allowedPrefixes.some(p => id.startsWith(p))
        && !excluded.some(e => id.includes(e))
    })
    .map(m => ({
      label: m.id,
      value: `openai/${m.id}`,
      icon: 'i-simple-icons-openai',
      provider: 'openai',
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

async function fetchAnthropicModels(apiKey: string): Promise<ProviderModel[]> {
  const res = await $fetch<{ data: { id: string, display_name: string }[] }>('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })

  return res.data
    .map(m => ({
      label: m.display_name || m.id,
      value: `anthropic/${m.id}`,
      icon: 'i-simple-icons-anthropic',
      provider: 'anthropic',
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

async function fetchGoogleModels(apiKey: string): Promise<ProviderModel[]> {
  const res = await $fetch<{ models: { name: string, displayName: string, supportedGenerationMethods: string[] }[] }>(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  )

  return res.models
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m) => {
      const modelId = m.name.replace('models/', '')
      return {
        label: m.displayName || modelId,
        value: `google/${modelId}`,
        icon: 'i-simple-icons-google',
        provider: 'google',
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

const fetchers: Record<string, (key: string) => Promise<ProviderModel[]>> = {
  openai: fetchOpenAIModels,
  anthropic: fetchAnthropicModels,
  google: fetchGoogleModels,
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

  const results = await Promise.allSettled(
    keys.map(async (key) => {
      const decryptedKey = decrypt(key.encryptedKey)
      const fetcher = fetchers[key.provider]
      if (!fetcher) return []
      return fetcher(decryptedKey)
    }),
  )

  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
})
