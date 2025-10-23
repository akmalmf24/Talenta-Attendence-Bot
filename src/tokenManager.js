import fs from 'fs'
import path from 'path'

const TOKEN_FILE = path.resolve('./token.json')

export function loadTokenData() {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null
    const raw = fs.readFileSync(TOKEN_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export function saveTokenData(data) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2))
}

export function clearTokenData() {
  try { if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE) } catch {}
}
