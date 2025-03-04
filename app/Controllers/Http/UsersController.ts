import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Profile from 'App/Models/Profile'
import Hash from '@ioc:Adonis/Core/Hash'

export default class UsersController {
  /**
   * Método para registrar um novo usuário
   */
  public async register({ request, response }: HttpContextContract) {
    const { username, email, password, photo } = request.only(['username', 'email', 'password', 'photo']);

    try {
        // Verificar se o usuário já existe
        const existingUser = await User.findBy('email', email)
        if (existingUser) {
            return response.badRequest({ message: 'E-mail já registrado' })
        }

        // Criptografar a senha
        const hashedPassword = await Hash.make(password)

        // Criar um novo usuário
        const user = await User.create({ username, email, photo, password: hashedPassword })

        // Criar um perfil vazio associado ao usuário
        await Profile.create({ userId: user.id, username: username })

        return response.created(user)
    } catch (error) {
        console.error('Erro ao registrar conta:', error)
        return response.badRequest({ message: 'Erro em registrar conta', error })
    }
}

  /**
   * Método para fazer login
   */
  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { username, password } = request.only(['username', 'password'])
      console.log('username recebido:', username)

      // Verificar se o usuário existe
      const user = await User.findBy('username', username)
      if (!user) {
        return response.unauthorized({ message: 'Credenciais inválidas' })
      }

      // Verificar se a senha está correta
      const passwordValid = await Hash.verify(user.password, password)
      if (!passwordValid) {
        return response.unauthorized({ message: 'Credenciais inválidas' })
      }

      // Gerar token opaco
      const token = await auth.use('api').generate(user)

      return response.ok({ message: 'Login bem-sucedido', token })
    } catch (error) {
      console.error('Falha no login:', error)
      return response.badRequest({ message: 'Falha no login', error })
    }
  }

  /**
   * Método para exibir o perfil do usuário autenticado
   */
  public async show({ auth, response }: HttpContextContract) {
    try {
      const user = auth.user

      if (!user) {
        console.log('Usuário não autenticado')
        return response.unauthorized({ error: 'Usuário não autenticado' })
      }

      return response.ok(user)
    } catch (error) {
      console.error('Erro ao obter usuário:', error)
      return response.internalServerError({ error: 'Erro ao obter usuário', details: error.message })
    }
  }

  /**
 * Método para exibir o perfil de um usuário específico pelo ID
 */
  public async showById({ params, response }: HttpContextContract) {
    try {
      // Capturar o ID dos parâmetros da URL
      const userId = params.id
  
      // Buscar o usuário pelo ID e carregar o perfil e os momentos associados
      const user = await User.findOrFail(userId)
  
      return response.ok(user)
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error)
      return response.notFound({ error: 'Usuário não encontrado' })
    }
  }
  
  
}
