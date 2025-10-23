import cron from 'node-cron'
import { config } from './config.js'
import { safeRequest, safeMultipart } from './apiClient.js'
import { getRandomImagePath } from './randomImage.js'
import { ensureValidTokenData } from './auth.js'
import { log } from './logger.js'

async function doPost (action) {
  log(`Start action: ${action} at ${new Date().toLocaleTimeString()}`)
  try {
    // Example: if you want to send JSON
    await safeMultipart(
      `/employees/personal/formal-education/543424`,
      {
        score: '3.82',
        year_from: '2020',
        majors: 'Teknik Informatika',
        filename: 'E-GrQsI2C6RzWn3F0mRvLsGzRjxpR3VS.pdf',
        year_to: '2024',
        institution_name: 'Universitas Telkom',
        education_degree: '80',
        certification: 'true'
      },
      null,
      'PUT'
    )
    log(`[${getRandomImagePath()}] Get ✅`)
  } catch (err) {
    log(`[${action}] Failed ❌:`, err?.response?.status || err.message)
  }
}

function getDelaySecondsFor (action) {
  if (action === 'CLOCK_IN') return Math.floor(Math.random() * 301) // 0..300s
  if (action === 'CLOCK_OUT') return Math.floor(Math.random() * 301) + 300 // 300..600s
  return 0
}

function scheduleJob(time, action) {
  const [hour, minute] = time.split(':')
  const cronTime = `${minute} ${hour} * * 1-5` // Senin–Jumat

  const job = cron.schedule(
    cronTime,
    () => {
      const delay = getDelaySecondsFor(action)
      log(`${action} scheduled with ${delay}s delay`)
      setTimeout(() => doPost(action), delay * 1000)
    },
    { timezone: config.TIMEZONE }
  )

  return job
}

export async function initScheduler () {
  log('=== Starting Scheduler ===')

  await ensureValidTokenData()

  log(`Scheduler config in: ${config.CLOCK_IN}`)
  log(`Scheduler config out: ${config.CLOCK_OUT}`)
  return {
    clockIn: scheduleJob(config.CLOCK_IN, 'CLOCK_IN'),
    clockOut: scheduleJob(config.CLOCK_OUT, 'CLOCK_OUT')
  }
}
