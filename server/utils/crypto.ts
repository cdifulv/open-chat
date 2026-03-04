import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT = 'open-chat-api-keys'

function deriveKey(): Buffer {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not set')
  }
  return pbkdf2Sync(secret, SALT, 100_000, KEY_LENGTH, 'sha256')
}

export function encrypt(plaintext: string): string {
  const key = deriveKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decrypt(encryptedStr: string): string {
  const key = deriveKey()
  const parts = encryptedStr.split(':')
  const [ivB64, authTagB64, dataB64] = parts
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error('Invalid encrypted string format')
  }

  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const encrypted = Buffer.from(dataB64, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)

  return decipher.update(encrypted) + decipher.final('utf8')
}
