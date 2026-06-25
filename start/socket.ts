import Database from '@ioc:Adonis/Lucid/Database'
import Ws from 'app/Services/ws'
import { createHash, timingSafeEqual } from 'crypto'

type ParsedOpaqueToken = {
  tokenId: string
  value: string
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8')
}

function parseOpaqueToken(token: string): ParsedOpaqueToken | null {
  const [encodedId, value] = token.split('.')

  if (!encodedId || !value || value.length !== 60) {
    return null
  }

  const tokenId = base64UrlDecode(encodedId)

  if (!/^\d+$/.test(tokenId)) {
    return null
  }

  return { tokenId, value }
}

function hashToken(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function isExpired(expiresAt: string | Date | null) {
  if (!expiresAt) {
    return false
  }

  return new Date(expiresAt).getTime() <= Date.now()
}

function getSocketToken(socket: any) {
  const authToken = socket.handshake.auth?.token
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim()
  }

  const authorization = socket.handshake.headers?.authorization
  if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim()
  }

  return null
}

async function getUserIdFromToken(token: string) {
  const parsedToken = parseOpaqueToken(token)

  if (!parsedToken) {
    return null
  }

  const tokenRecord = await Database.from('api_tokens')
    .where('id', parsedToken.tokenId)
    .where('type', 'opaque_token')
    .first()

  if (!tokenRecord || isExpired(tokenRecord.expires_at)) {
    return null
  }

  if (!safeCompare(String(tokenRecord.token), hashToken(parsedToken.value))) {
    return null
  }

  return Number(tokenRecord.user_id)
}

Ws.boot()

Ws.io.use(async (socket, next) => {
  try {
    const token = getSocketToken(socket)
    if (!token) {
      next(new Error('Unauthorized'))
      return
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      next(new Error('Unauthorized'))
      return
    }

    socket.data.userId = userId
    next()
  } catch {
    next(new Error('Unauthorized'))
  }
})

Ws.io.on('connection', (socket) => {
  const room = `user:${socket.data.userId}`
  socket.join(room)

  socket.on('join', () => {
    socket.join(room)
  })

  socket.on('mensagem', (data) => {
    socket.emit('resposta', `Servidor recebeu: ${data}`)
  })

  socket.on('disconnect', () => {})
})
