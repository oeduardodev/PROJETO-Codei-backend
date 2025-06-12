import { v2 as cloudinary } from 'cloudinary'
import Env from '@ioc:Adonis/Core/Env'

cloudinary.config({
  cloud_name: Env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Env.get('CLOUDINARY_API_KEY'),
  api_secret: Env.get('CLOUDINARY_API_SECRET'),
})

export async function uploadToCloudinary(filePath: string) {
  return cloudinary.uploader.upload(filePath)
}
