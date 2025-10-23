import axios from 'axios'
import jwt from 'jsonwebtoken'
import { config } from './config.js'
import { loadTokenData, saveTokenData, clearTokenData } from './tokenManager.js'
import { log } from './logger.js'

// axios instance untuk auth (NO interceptors) — prevents recursion
const authAxios = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: { ...config.DEFAULT_HEADERS }
})

function isAccessExpired(accessToken) {
  try {
    const decoded = jwt.decode(accessToken)
    if (!decoded || !decoded.exp) return true
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
}

export async function login() {
  log('[AUTH] Logging in...')
  const res = await authAxios.post(config.LOGIN_ENDPOINT, config.USER_CREDENTIAL)
  const tokens = res.data
  saveTokenData(tokens.data)
  log('[AUTH] Logged in ✅')
  return tokens
}

export async function refresh(refreshToken) {
  if (!refreshToken) return null
  log('[AUTH] Refreshing token...')
  try {
    const res = await authAxios.post(config.REFRESH_PATH, { refresh_token: refreshToken })
    const newTokens = res.data
    saveTokenData(newTokens)
    log('[AUTH] Refreshed ✅')
    return newTokens
  } catch (err) {
    log('[AUTH] Refresh failed:', err?.response?.status || err.message)
    return null
  }
}

/**
 * Ensure there's a valid access token:
 * - if no token -> login
 * - if expired -> try refresh -> if fail -> login
 * returns tokenData object { access_token, refresh_token, ... }
 */
export async function ensureValidTokenData() {
  let tokenData = loadTokenData()
  if (!tokenData) {
    tokenData = await login()
    return tokenData
  }

  if (isAccessExpired(tokenData.token)) {
    const refreshed = await refresh(tokenData.token)
    if (refreshed) return refreshed
    // refresh gagal -> relogin
    tokenData = await login()
    return tokenData
  }

  return tokenData
}
