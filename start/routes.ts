/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'word' }
})

Route.group(() => {
  // Rotas de autenticação
  Route.post('/login', 'UsersController.login')
  Route.post('/register', 'UsersController.register')

  // Rotas de momentos
  Route.resource('/moments', 'MomentsController').apiOnly()

  // Rota para adicionar comentários
  Route.post('/moments/:momentId/comments', 'CommentsController.store')

  // Rota para adicionar likes (requer autenticação)
  Route.post('/moments/:momentId/like', 'LikesController.like').middleware('auth')
}).prefix('/api')
