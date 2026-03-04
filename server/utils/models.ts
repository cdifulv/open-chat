import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export function resolveModel(modelId: string, apiKey: string) {
  const [provider, ...rest] = modelId.split('/')
  const modelName = rest.join('/')

  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey })(modelName)
    case 'anthropic':
      return createAnthropic({ apiKey })(modelName)
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(modelName)
    default:
      throw createError({ statusCode: 400, statusMessage: `Unsupported provider: ${provider}` })
  }
}
