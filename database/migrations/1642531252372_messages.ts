import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Messages extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    this.schema.createTable('messages', (table) => {
      table.increments('id')
      table.integer('sender_id').unsigned().notNullable()
      table.integer('receiver_id').unsigned().notNullable()
      table.text('content').notNullable()
      table.boolean('read').defaultTo(false)
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
