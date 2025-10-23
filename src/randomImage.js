import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getDayFolderNumber() {
  const day = new Date().getDay()
  return day
}


// Ambil random file dari folder images/{hari}
export function getRandomImagePath() {
  const dayFolder = getDayFolderNumber()
  const folderPath = path.join(__dirname, 'images', String(dayFolder))

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder tidak ditemukan: ${folderPath}`)
  }

  const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  if (files.length === 0) {
    throw new Error(`Tidak ada file gambar di folder: ${folderPath}`)
  }

  const randomFile = files[Math.floor(Math.random() * files.length)]
  return path.join(folderPath, randomFile)
}