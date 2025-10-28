import dotenv from 'dotenv'
dotenv.config(
  {
    debug: false
  }
)

export const config = {
  COMPANY_ID: process.env.COMPANY_ID || 2767,
  USER_CREDENTIAL: {
    email: process.env.EMAIL || '',
    password: process.env.PASSWORD || '',
    device_id: '6b4ddc61d61bf254'
  },
  CLOCK_IN: process.env.CLOCK_IN || '09:00',
  CLOCK_OUT: process.env.CLOCK_OUT || '18:00',
  LATITUDE: process.env.LATITUDE || "-6.913719446083202",
  LONGITUDE: process.env.LONGITUDE || "107.60077482052053",
  TIMEZONE: process.env.TIMEZONE || 'Asia/Jakarta',
  API_BASE_URL: 'https://api-mobile.talenta.co/api',
  DEFAULT_HEADERS: {
    'X-Device-Id': '6b4ddc61d61bf254',
    'X-App-Version': '2.102.0 (20611)',
    'X-Device-Model': 'Google sdk_gphone64_arm64',
    'X-Os-Version': 'Android 16',
    'X-Tl-Legacy-Response': 'true',
    'X-Portal-Version': '2',
    'User-Agent': 'okhttp/4.11.0',
    "Is_return_message": 'true',
  }
}
