import { authClient } from '~/utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (!session.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (session.value && to.path === '/login') {
    return navigateTo('/')
  }

  if (session.value && !session.value.user.onboardingCompleted && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }

  if (session.value && session.value.user.onboardingCompleted && to.path === '/onboarding') {
    return navigateTo('/')
  }
})
