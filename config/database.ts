import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const dbSsl = Env.get('DB_SSL', false)
const shouldUseSsl = typeof dbSsl === 'boolean' ? dbSsl : String(dbSsl).toLowerCase() === 'true'
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
  /*
  |---------------------------------------------------------------------------
  | Connection
  |---------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  connection: Env.get('DB_CONNECTION', 'sqlite'), // Default to SQLite if not defined

  connections: {
    /*
    |---------------------------------------------------------------------------
    | SQLite
    |---------------------------------------------------------------------------
    |
    | Configuration for the SQLite database. Make sure to install the driver
    | from npm when using this connection.
    |
    | npm i sqlite3
    |
    */
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: Application.tmpPath('db.sqlite3'), // SQLite file location
      },
      migrations: {},
      useNullAsDefault: true,
      healthCheck: false,
      debug: false,
    },

    /*
    |---------------------------------------------------------------------------
    | PostgreSQL
    |---------------------------------------------------------------------------
    |
    | Configuration for the PostgreSQL database. Make sure to install the driver
    | from npm when using this connection.
    |
    | npm i pg
    |
    */
    pg: {
      client: 'pg',
      connection: {
        host: Env.get('DB_HOST', parsedDatabaseUrl?.hostname),
        port: Env.get('DB_PORT', parsedDatabaseUrl?.port ? Number(parsedDatabaseUrl.port) : undefined),
        user: Env.get('DB_USER', parsedDatabaseUrl?.username),
        password: Env.get('DB_PASSWORD', parsedDatabaseUrl?.password),
        database: Env.get('DB_DATABASE', parsedDatabaseUrl?.pathname.replace('/', '')),
        ssl: shouldUseSsl
          ? {
              rejectUnauthorized: false,
            }
          : false,
      },
      healthCheck: false,
      debug: false,
    },
  },
}

export default databaseConfig
