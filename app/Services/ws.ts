import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'
import Env from '@ioc:Adonis/Core/Env'

function getAllowedOrigins() {
  const configuredOrigins = Env.get('ALLOWED_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const frontendUrl = Env.get('FRONTEND_URL', '').trim()

  return Array.from(new Set([...configuredOrigins, frontendUrl, 'http://localhost:4200']))
}

class Ws {
  public io!: Server
  private booted = false

  public boot() {
    if (this.booted) {
      return
    }
    this.booted = true
    const allowedOrigins = getAllowedOrigins()

    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
          }

          callback(new Error('Origin not allowed by CORS'))
        },
        credentials: true,
      },
    })
  }
}

export default new Ws()
