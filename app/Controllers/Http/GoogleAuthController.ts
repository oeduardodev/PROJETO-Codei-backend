import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import axios from 'axios'
import User from 'app/Models/User'
import Profile from 'app/Models/Profile'
import Hash from '@ioc:Adonis/Core/Hash'

export default class GoogleAuthController {
  public async redirect({ response }: HttpContextContract) {
    const clientId = Env.get('GOOGLE_CLIENT_ID', '')
    const redirectUri = Env.get('GOOGLE_REDIRECT_URI', '')
    const scope = 'openid email profile'
    if (!clientId || !redirectUri) {
      console.error('Google OAuth misconfigured. GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI missing')
      return response.badRequest({ message: 'Google OAuth não configurado no servidor. Verifique GOOGLE_CLIENT_ID e GOOGLE_REDIRECT_URI.' })
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId,
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(
      scope,
    )}&access_type=offline&prompt=consent`

    return response.redirect(authUrl)
  }

  public async callback({ request, response, auth }: HttpContextContract) {
    const code = request.input('code')
    if (!code) {
      return response.badRequest({ message: 'Código OAuth não fornecido.' })
    }

    try {
      const clientId = Env.get('GOOGLE_CLIENT_ID', '')
      const clientSecret = Env.get('GOOGLE_CLIENT_SECRET', '')
      const redirectUri = Env.get('GOOGLE_REDIRECT_URI', '')

      if (!clientId || !clientSecret || !redirectUri) {
        console.error('Google OAuth misconfigured. Missing CLIENT_ID/SECRET/REDIRECT_URI')
        return response.badRequest({ message: 'Google OAuth não configurado no servidor. Verifique GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI.' })
      }

      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )

      const accessToken = tokenRes.data.access_token

      const userinfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const { email, name } = userinfoRes.data
      if (!email) {
        return response.badRequest({ message: 'Não foi possível obter e-mail do Google.' })
      }

      let user = await User.findBy('email', email)
      if (!user) {
        const usernameBase = name ? name.split(' ')[0].toLowerCase() : email.split('@')[0]
        const username = `${usernameBase}${Date.now().toString().slice(-4)}`
        const randomPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await Hash.make(randomPassword)

        user = await User.create({ username, email, password: hashedPassword })
        await Profile.create({ userId: user.id, username })
      }

      const token = await auth.use('api').generate(user)

      const frontendUrl = Env.get('FRONTEND_URL', 'http://localhost:4200')
      return response.redirect(`${frontendUrl}/login?token=${token.token}`)
    } catch (error: any) {
      console.error('Erro no OAuth Google:', error)
      return response.badRequest({ message: 'Erro no OAuth Google', error: error?.response?.data || error.message })
    }
  }
}
