import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Profile from 'App/Models/Profile'
import Hash from '@ioc:Adonis/Core/Hash'

export default class UsersController {

  /*
   * Registra um novo usuário no sistema
   */
  public async register({ request, response }: HttpContextContract) {
    const { username, email, password, photo } = request.only(['username', 'email', 'password', 'photo']);

    try {
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return response.badRequest({ message: 'E-mail já registrado' })
      }

      const hashedPassword = await Hash.make(password)

      const user = await User.create({ username, email, photo, password: hashedPassword })

      await Profile.create({ userId: user.id, username: username })

      return response.created(user)
    } catch (error) {
      console.error('Erro ao registrar conta:', error)
      return response.badRequest({ message: 'Erro em registrar conta', error })
    }
  }

  /*
   * Realiza o login do usuário e gera um token de autenticação
   */
  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { username, password } = request.only(['username', 'password'])

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

  /*
   * Retorna os dados do usuário autenticado
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

  /*
   * Retorna os dados de um usuário específico pelo ID
   */
  public async showById({ params, response }: HttpContextContract) {
    try {
      const userId = params.id

      const user = await User.findOrFail(userId)

      return response.ok(user)
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error)
      return response.notFound({ error: 'Usuário não encontrado' })
    }
  }
}
