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
        naturalSort: true,
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
      connection: {
        host: Env.get('DB_HOST', 'localhost'),
        port: Env.get('DB_PORT', 5432),
        user: Env.get('DB_USER', 'your_db_user'),
        password: Env.get('DB_PASSWORD', 'your_db_password'),
        database: Env.get('DB_DATABASE', 'your_db_name'),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: false,
    },
  },
}

export default databaseConfig
