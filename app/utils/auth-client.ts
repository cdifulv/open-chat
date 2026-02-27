import { createAuthClient } from 'better-auth/vue'
import { inferAdditionalFields, magicLinkClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    inferAdditionalFields({
      user: {
        onboardingCompleted: {
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
      },
    }),
  ],
})
