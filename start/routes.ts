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

  }).prefix('/auth')

  // Rotas de Momentos (Moments)
  Route.group(() => {
    Route.get('/', 'MomentsController.index')
    Route.post('/', 'MomentsController.store').middleware('auth')
    Route.get('/:id', 'MomentsController.show')
    Route.delete('/:id', 'MomentsController.destroy').middleware('auth') 
    Route.post('/:id/comments', 'CommentsController.store')
    Route.get('/:id/comments', 'CommentsController.showByMomentId')
    Route.post('/:id/like', 'LikesController.like').middleware('auth')
    Route.get('/:id/like', 'LikesController.checkLike').middleware('auth')
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
    Route.post('/send', 'MessagesController.sendMessages').middleware('auth')
    Route.get('/conversations', 'MessagesController.getMessages').middleware('auth')
    Route.get('/:id', 'MessagesController.getMessagesById').middleware('auth')
  }).prefix('/message')

  // Rotas de Amigos (friends)
  Route.group(() => {
    Route.get('/', 'ProfilesController.listFriends').middleware('auth')
    Route.post('/', 'ProfilesController.addFriend').middleware('auth')
    Route.delete('/:friendId', 'ProfilesController.removeFriend').middleware('auth')
    Route.get('/:userId', 'ProfilesController.listFriendsByID')
  }).prefix('/friends')

}).prefix('/api') 
