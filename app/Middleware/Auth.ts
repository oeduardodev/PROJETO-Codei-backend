import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'

export default class AuthMiddleware {
  /**
   * The URL to redirect to when request is Unauthorized
   */
  protected redirectTo = '/login'

  /**
   * Authenticates the current HTTP request against a custom set of defined
   * guards.
   *
   * The authentication loop stops as soon as the user is authenticated using any
   * of the mentioned guards and that guard will be used by the rest of the code
   * during the current request.
   */
  protected async authenticate(auth: HttpContextContract['auth'], guards: any[]) {
    let guardLastAttempted: string | undefined

    for (let guard of guards) {
      guardLastAttempted = guard

      if (await auth.use(guard).check()) {
        /**
         * Instruct auth to use the given guard as the default guard for
         * the rest of the request, since the user authenticated
         * succeeded here
         */
        auth.defaultGuard = guard
        return true
      }
    }

    /**
     * Unable to authenticate using any guard
     */
    throw new AuthenticationException(
      'Unauthorized access',
      'E_UNAUTHORIZED_ACCESS',
      guardLastAttempted,
      this.redirectTo
    )
  }

  /**
   * Handle request
   */
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    customGuards: string[]
  ) {
    const guards = customGuards.length ? customGuards : [auth.name]
    console.log('Guardas usados:', guards)

    await this.authenticate(auth, guards)
    console.log('Solicitação autenticada com sucesso')

    await next()
  }
}
