import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Comments extends BaseSchema {
  protected tableName = 'comments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary() // Garantir que 'id' seja chave primária
      table.string('username').notNullable() // Garantir que 'username' seja obrigatório
      table.string('photo').nullable() // Permitir que 'photo' seja nulo
      table.string('text').notNullable() // Garantir que 'text' seja obrigatório
      table.integer('moment_id').unsigned().references('id').inTable('moments').onDelete('CASCADE') // Vincular 'moment_id' à tabela 'moments'

      /**
       * Usar timestamp com timezone para garantir compatibilidade com bancos como PostgreSQL
       */
      table.timestamps(true) // Criação de 'created_at' e 'updated_at' com timezone
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName) // Remover a tabela 'comments'
  }
}
