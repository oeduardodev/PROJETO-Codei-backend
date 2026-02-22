/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/

require('dns').setDefaultResultOrder('ipv4first')

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import 'reflect-metadata'
import dotenv from 'dotenv'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'

const envPaths = [join(__dirname, '.env'), join(__dirname, '..', '.env')]
const envPath = envPaths.find((path) => existsSync(path))

if (envPath) {
  dotenv.config({ path: envPath })
}

sourceMapSupport.install({ handleUncaughtExceptions: false })

new Ignitor(__dirname).httpServer().start()
