import { v2 as cloudinary } from 'cloudinary'
import Env from '@ioc:Adonis/Core/Env'

type CloudinaryCredentials = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

type CredentialSource = 'CLOUDINARY_*' | 'CLOUDINARY_URL'

type ResolvedCloudinaryCredentials = CloudinaryCredentials & {
  source: CredentialSource
}

let isConfigured = false
let configuredCredentialSummary = ''

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

function hasCompleteCredentials(credentials: Partial<CloudinaryCredentials>): credentials is CloudinaryCredentials {
  return Boolean(credentials.cloudName && credentials.apiKey && credentials.apiSecret)
}

function resolveCredentials(): ResolvedCloudinaryCredentials {
  const envCredentials = {
    cloudName: normalizeEnvValue(Env.get('CLOUDINARY_CLOUD_NAME', '')),
    apiKey: normalizeEnvValue(Env.get('CLOUDINARY_API_KEY', '')),
    apiSecret: normalizeEnvValue(Env.get('CLOUDINARY_API_SECRET', '')),
  }
  const urlCredentials = parseCloudinaryUrl(Env.get('CLOUDINARY_URL', ''))

  if (hasCompleteCredentials(urlCredentials)) {
    return { ...urlCredentials, source: 'CLOUDINARY_URL' }
  }

  if (hasCompleteCredentials(envCredentials)) {
    return { ...envCredentials, source: 'CLOUDINARY_*' }
  }

  if (!hasCompleteCredentials(envCredentials) && !hasCompleteCredentials(urlCredentials)) {
    throw new Error(
      'Cloudinary credentials missing. Configure CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.'
    )
  }

  throw new Error(
    'Cloudinary credentials incomplete. Define all CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET values or a full CLOUDINARY_URL.'
  )
}

function summarizeCredentials(credentials: ResolvedCloudinaryCredentials): string {
  const keySuffix = credentials.apiKey.slice(-4)
  return `source=${credentials.source}; cloud_name=${credentials.cloudName}; api_key_suffix=${keySuffix}`
}

function configureCloudinary() {
  if (isConfigured) return

  const credentials = resolveCredentials()
  configuredCredentialSummary = summarizeCredentials(credentials)

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
        `Cloudinary Invalid Signature. ${configuredCredentialSummary}. Validate that cloud_name/api_key/api_secret belong to the same Cloudinary environment.`
      )
    }

    throw error
  }
}
