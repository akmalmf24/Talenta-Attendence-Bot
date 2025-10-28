import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'

const USE_CLOUDINARY =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET

if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

function getDayFolderNumber() {
  return new Date().getDay()
}

function getRandomLocalImagePath() {
  const dayFolder = getDayFolderNumber()
  const folderPath = path.join(process.cwd(), 'images', String(dayFolder))

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder tidak ditemukan: ${folderPath}`)
  }

  const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  if (files.length === 0) {
    throw new Error(`Tidak ada file gambar di folder: ${folderPath}`)
  }

  const randomFile = files[Math.floor(Math.random() * files.length)]

  const relativePath = path.join('images', String(dayFolder), randomFile).replace(/\\/g, '/')
  return relativePath
}

async function getRandomCloudinaryUrl() {
  const dayFolder = getDayFolderNumber()
  console.log(dayFolder)
  const folderPath = `images/${dayFolder}`

  const res = await cloudinary.search
    .expression(`folder:${folderPath} AND resource_type:image`)
    .max_results(100)
    .execute()

  const resources = res.resources || []
  if (resources.length === 0) {
    throw new Error(`Tidak ada file gambar di folder Cloudinary: ${folderPath}`)
  }

  const randomImg = resources[Math.floor(Math.random() * resources.length)]

  return {
    filename: `${randomImg.filename}.${randomImg.format}`,
    url: randomImg.secure_url
  }
}

export async function getRandomImage() {
  if (USE_CLOUDINARY) {
    return await getRandomCloudinaryUrl()
  } else {
    return getRandomLocalImagePath()
  }
}