import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  // Rotas de autenticação
  Route.post('/login', 'UsersController.login')
  Route.post('/register', 'UsersController.register')
  Route.get('/user', 'UsersController.show').middleware('auth')
  Route.get('/user/:id', 'UsersController.showById')
  
  
  // Rotas de momentos
  Route.resource('/moments', 'MomentsController')
  .apiOnly()
  .middleware({
    store: ['auth'],   
    update: ['auth'],  
    destroy: ['auth'], 
  });

  // Rota para adicionar comentários (sem autenticação)
  Route.post('/moments/:momentId/comments', 'CommentsController.store')

  // Rota para adicionar likes 
  Route.post('/moments/:momentId/like', 'LikesController.like').middleware('auth')

  // Rota para capturar se existe likes 
  Route.get('/moments/:momentId/like', 'LikesController.checkLike').middleware('auth')

  // Rotas de perfil (Profile) com autenticação
  Route.group(() => {
    Route.post('/', 'ProfilesController.store').middleware('auth')
    Route.get('/me', 'ProfilesController.me').middleware('auth')
    Route.get('/:id', 'ProfilesController.show')
    Route.put('/:id', 'ProfilesController.update').middleware('auth')
    Route.delete('/:id', 'ProfilesController.destroy').middleware('auth')
  }).prefix('/profiles')  
  
}).prefix('/api')
