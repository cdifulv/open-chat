interface Model {
  label: string
  value: string
  icon: string
  provider: string
}

export function useModels() {
  const { data: models, refresh, status } = useFetch<Model[]>('/api/user/models', {
    default: () => [],
    lazy: true,
  })

  const model = useCookie<string>('model', { default: () => '' })

  watch(models, (list) => {
    if (!list.length) return
    if (!model.value || !list.some(m => m.value === model.value)) {
      model.value = list[0]!.value
    }
  })

  return {
    models,
    model,
    refresh,
    status,
  }
}
