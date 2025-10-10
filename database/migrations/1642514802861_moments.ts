import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Moments extends BaseSchema {
  protected tableName = 'moments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') 

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('title')
      table.string('description')
      table.string('image')
      table.integer('likes_count').defaultTo(0)

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
