import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Likes extends BaseSchema {
  protected tableName = 'likes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('moment_id').unsigned().references('id').inTable('moments').onDelete('CASCADE')
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
