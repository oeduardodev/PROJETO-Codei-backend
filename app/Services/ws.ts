import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server' 

class Ws {
  public io: Server
  private booted = false 

  public boot() {
    if (this.booted) { 
      return 
    }
    this.booted = true // Marca o servidor como inicializado
    this.io = new Server(AdonisServer.instance!, { // Cria uma nova instância do servidor WebSocket
      cors: {
        origin: '*', // Configura CORS para permitir qualquer origem
      },
    })
  }
}

export default new Ws() // Exporta uma instância da classe Ws como padrão