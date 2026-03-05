import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const rawDatabaseUrl = Env.get('DATABASE_URL')
let parsedDatabaseUrl: URL | null = null

if (rawDatabaseUrl) {
  try {
    parsedDatabaseUrl = new URL(String(rawDatabaseUrl))
  } catch {
    parsedDatabaseUrl = null
  }
}

const databaseConfig: DatabaseConfig = {
  connection: Env.get('DB_CONNECTION', 'pg'), // Mudamos para 'pg' como padrão

  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: Application.tmpPath('db.sqlite3'),
      },
      migrations: {
        paths: [Application.databasePath('migrations')],
      },
      useNullAsDefault: true,
      healthCheck: false,
      debug: false,
    },

    pg: {
      client: 'pg',
      connection: {
        connectionString: Env.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
      } as any,
      pool: {
        min: 2,
        max: 10,
      },
      migrations: {
        paths: [Application.databasePath('migrations')],
      },
    },
  },
}

export default databaseConfig
