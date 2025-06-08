import Ws from 'App/Services/ws'

Ws.boot()

Ws.io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId.toString())
  })

  socket.on('mensagem', (data) => {
    socket.emit('resposta', `Servidor recebeu: ${data}`)
  })

  socket.on('disconnect', () => {
  })
})
