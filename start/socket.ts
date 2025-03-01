// start/socket.ts
import Ws from 'App/Services/ws'

Ws.boot()

Ws.io.on('connection', (socket) => {
  console.log('Usuário conectado')

  socket.on('mensagem', (data) => {
    console.log(`Mensagem recebida: ${data}`)
    socket.emit('resposta', `Servidor recebeu: ${data}`)
  })

  socket.on('disconnect', () => {
    console.log('Usuário desconectado')
  })
})
