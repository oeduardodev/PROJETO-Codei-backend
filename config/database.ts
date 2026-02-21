import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

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
      migrations: {
        paths: ['database/migrations'],
      },
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
      connection: Env.get('DATABASE_URL'),
      migrations: {
        paths: ['database/migrations'],
      },
    },
  },
}

export default databaseConfig
