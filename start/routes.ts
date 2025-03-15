import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { 
    hello: 'world',
    conected: process.env.DB_CONNECTION 
  }
})

Route.group(() => {

  // Rotas de Autorização (auth)
  Route.group(() => {
    Route.post('/login', 'UsersController.login')
    Route.post('/register', 'UsersController.register')
    Route.get('/user', 'UsersController.show').middleware('auth')
    Route.get('/user/:id', 'UsersController.showById')
    Route.resource('/moments', 'MomentsController')
      .apiOnly()
      .middleware({
        store: ['auth'],
        update: ['auth'],
        destroy: ['auth'],
      });
  }).prefix('/auth')

  // Rotas de Momentos (Moments)
  Route.group(() => {
    Route.post('/:momentId/comment', 'CommentsController.store')
    Route.get('/:momentId/comments', 'CommentsController.showByMomentId')
    Route.post('/:momentId/like', 'LikesController.like').middleware('auth')
    Route.get('/:momentId/like', 'LikesController.checkLike').middleware('auth')
  }).prefix('/moments')

  // Rotas de Perfil (Profile) 
  Route.group(() => {
    Route.post('/', 'ProfilesController.store').middleware('auth')
    Route.get('/me', 'ProfilesController.me').middleware('auth')
    Route.get('/:id', 'ProfilesController.show')
    Route.put('/:id', 'ProfilesController.update').middleware('auth')
    Route.delete('/:id', 'ProfilesController.destroy').middleware('auth')
  }).prefix('/profile')

  // Rotas de Mensagens (message) 
  Route.group(() => {
    Route.post('/send', 'MessagesController.send').middleware('auth')
    Route.get('/conversations', 'MessagesController.index').middleware('auth')
  }).prefix('/message')

  // Rotas de Amigos (friends)
  Route.group(() => {
    Route.get('/', 'ProfilesController.listFriends').middleware('auth')
    Route.post('/:friendId', 'ProfilesController.addFriend').middleware('auth')
    Route.delete('/:friendId', 'ProfilesController.removeFriend').middleware('auth')
    Route.get('/:userId', 'ProfilesController.listFriendsByID')
  }).prefix('/friends')

}).prefix('/api') 
