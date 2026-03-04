import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { and, eq } from 'drizzle-orm'
import { apiKeys, chats, messages } from '../../database/schema'
import { auth } from '../../utils/auth'
import { decrypt } from '../../utils/crypto'
import { db } from '../../utils/db'
import { resolveModel } from '../../utils/models'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const chatId = getRouterParam(event, 'id')!

  const [chat] = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1)

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  if (chat.userId !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody<{ model: string; messages: UIMessage[] }>(event)

  const provider = body.model.split('/')[0]!

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, session.user.id), eq(apiKeys.provider, provider)))
    .limit(1)

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: `No API key found for ${provider}. Please add one in Settings.`,
    })
  }

  const decryptedKey = decrypt(key.encryptedKey)
  const model = resolveModel(body.model, decryptedKey)

  const aiMessages = await convertToModelMessages(body.messages)

  // Save the latest user message to DB
  const lastUserMsg = body.messages[body.messages.length - 1]
  if (lastUserMsg?.role === 'user') {
    await db.insert(messages).values({
      chatId,
      role: 'user',
      parts: lastUserMsg.parts,
    })

    // Update chat title from first user message
    if (aiMessages.filter((m) => m.role === 'user').length === 1) {
      const title = lastUserMsg.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('')
        .slice(0, 100)
      await db.update(chats).set({ title }).where(eq(chats.id, chatId))
    }
  }

  const result = streamText({
    model,
    messages: aiMessages,
    onFinish: async ({ text }) => {
      await db.insert(messages).values({
        chatId,
        role: 'assistant',
        parts: [{ type: 'text', text }],
      })
    },
  })

  return result.toTextStreamResponse()
})
