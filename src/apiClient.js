import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { config } from './config.js'
import { loadTokenData, saveTokenData } from './tokenManager.js'
import { refresh as authRefresh, login as authLogin } from './auth.js'

// main API axios (has interceptor)
export const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 15000,
  headers: { ...config.DEFAULT_HEADERS }
})

// refresh lock: holds the single in-flight refresh/login promise
let refreshingPromise = null

async function doRefreshOnce() {
  // ensure only one refresh/login runs at a time
  if (refreshingPromise) return refreshingPromise

  refreshingPromise = (async () => {
    try {
      const tokenData = loadTokenData()
      // try refresh first
      const refreshed = await authRefresh(tokenData?.refresh_token)
      if (refreshed) return refreshed
      // refresh failed -> login
      const logged = await authLogin()
      return logged
    } finally {
      // reset after finished
      refreshingPromise = null
    }
  })()

  return refreshingPromise
}

// attach token for a request (used by request interceptor too)
async function attachAccessTokenToConfig(configObj) {
  const tokenData = loadTokenData()
  if (tokenData?.token) {
    configObj.headers = configObj.headers || {}
    configObj.headers.Authorization = `Bearer ${tokenData.token}`
  }
}

// request interceptor -> attach token
api.interceptors.request.use(async (req) => {
  await attachAccessTokenToConfig(req)
  return req
})

// response interceptor -> handle 401 with single refresh attempt, then optional relogin handled inside doRefreshOnce()
// make sure we don't retry infinite times
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    // if no originalRequest or already retried, just throw
    if (!originalRequest || originalRequest._retry) {
      throw error
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true // mark so we don't infinite loop
      try {
        const newTokenData = await doRefreshOnce()
        if (!newTokenData?.token) throw new Error('No token after refresh/login')

        // Save token (auth functions already save, but be safe)
        saveTokenData(newTokenData)

        // attach new token to original request and retry
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newTokenData.token}`
        return api.request(originalRequest)
      } catch (e) {
        // failed even after refresh/login - bubble original auth error
        throw e
      }
    }

    // non-auth error
    throw error
  }
)

/**
 * safeRequest: dynamic method (POST/PUT/PATCH/GET...), data body for JSON requests.
 * Returns axios response object.
 */
export async function safeRequest(url, data = {}, method = 'post') {
  const m = method.toLowerCase()
  return api.request({ url, method: m, data })
}

/**
 * safeMultipart: multipart upload with method dynamic
 */
export async function safeMultipart(url, extraFields = {}, filePath = null, method = 'post') {
  const form = new FormData()

  if (filePath) {
    form.append('file', fs.createReadStream(filePath))
  }

  for (const [k, v] of Object.entries(extraFields || {})) {
    form.append(k, v)
  }

  // Gabung header default axios + form header
  const headers = {
    ...form.getHeaders(), // multipart headers
  }

  return api.request({
    url,
    method: method.toLowerCase(),
    data: form,
    headers,
  })
}
