export function useModels() {
  const models = [
    { label: 'GPT-4o', value: 'openai/gpt-4o', icon: 'i-simple-icons-openai' },
    { label: 'Claude Sonnet 4', value: 'anthropic/claude-sonnet-4', icon: 'i-simple-icons-anthropic' },
    { label: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash', icon: 'i-simple-icons-google' }
  ]

  const model = useCookie<string>('model', { default: () => 'openai/gpt-4o' })

  return {
    models,
    model
  }
}
