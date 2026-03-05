import { v2 as cloudinary } from 'cloudinary'
import Env from '@ioc:Adonis/Core/Env'

type CloudinaryCredentials = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

let isConfigured = false

function normalizeEnvValue(value: string): string {
  const trimmedValue = value.trim()

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1).trim()
  }

  return trimmedValue
}

function parseCloudinaryUrl(cloudinaryUrl: string): Partial<CloudinaryCredentials> {
  const normalizedUrl = normalizeEnvValue(cloudinaryUrl)
  if (!normalizedUrl) return {}

  try {
    const parsedUrl = new URL(normalizedUrl)
    if (parsedUrl.protocol !== 'cloudinary:') return {}

    return {
      cloudName: normalizeEnvValue(decodeURIComponent(parsedUrl.hostname)),
      apiKey: normalizeEnvValue(decodeURIComponent(parsedUrl.username)),
      apiSecret: normalizeEnvValue(decodeURIComponent(parsedUrl.password)),
    }
  } catch {
    return {}
  }
}

function resolveCredentials(): CloudinaryCredentials {
  const credentialsFromUrl = parseCloudinaryUrl(Env.get('CLOUDINARY_URL', ''))

  const cloudName =
    credentialsFromUrl.cloudName || normalizeEnvValue(Env.get('CLOUDINARY_CLOUD_NAME', ''))
  const apiKey = credentialsFromUrl.apiKey || normalizeEnvValue(Env.get('CLOUDINARY_API_KEY', ''))
  const apiSecret =
    credentialsFromUrl.apiSecret || normalizeEnvValue(Env.get('CLOUDINARY_API_SECRET', ''))

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary credentials missing. Configure CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.'
    )
  }

  return { cloudName, apiKey, apiSecret }
}

function configureCloudinary() {
  if (isConfigured) return

  const credentials = resolveCredentials()

  cloudinary.config({
    cloud_name: credentials.cloudName,
    api_key: credentials.apiKey,
    api_secret: credentials.apiSecret,
  })

  isConfigured = true
}

export async function uploadToCloudinary(filePath: string) {
  configureCloudinary()

  try {
    return await cloudinary.uploader.upload(filePath)
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.includes('Invalid Signature')) {
      throw new Error(
        'Cloudinary Invalid Signature. Validate CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET from the same account.'
      )
    }

    throw error
  }
}
