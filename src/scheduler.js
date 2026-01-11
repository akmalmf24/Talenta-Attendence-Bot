import cron from 'node-cron'
import { config } from './config.js'
import { ensureValidTokenData } from './auth.js'
import { log } from './logger.js'
import { getCurrentShift, submitAttendance, getAttendance} from './talentaService.js'
import dayjs from 'dayjs'
import { sendText } from './whatsapp/sender.js'


export async function doPost(action) {
  try {
    const today = dayjs().format('YYYY-MM-DD')
    const shift = await getCurrentShift(today)
    log(`Start action: ${action} at ${new Date().toLocaleTimeString()} on shift ${shift.name} (${shift.id})`)

    let event = "clock_in"
    if (action == "CLOCK_OUT") {
      event = "clock_out"
    }
    await submitAttendance(shift.id, shift.setting_id, today, event)
  } catch (err) {
    console.log(`[${action}] Failed ❌:`, err)
  }
}

function getDelaySecondsFor(action) {
  if (action === 'CLOCK_IN') return Math.floor(Math.random() * 300) // 0..300s
  if (action === 'CLOCK_OUT') return Math.floor(Math.random() * 301) + 300 // 300..600s
  return 0
}

function scheduleJob(time, action) {
  const [hour, minute] = time.split(':')
  const cronTime = `${minute} ${hour} * * 1-5` // Monday - Friday
  
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

async function reminderAttendance(time, action){
  const [hour, minute] = time.split(':')
  const cronTime = `${minute} ${hour} * * 1-5`
  const today = dayjs().format('YYYY-MM-DD')
  const attendance = await getAttendance(today)
  
  cron.schedule(
    cronTime,
    async () => {
      if(action == "CLOCK_IN" && !attendance.clock_in){
        await sendText(
          '6282115262249@s.whatsapp.net',
          `Peringatan!!, anda belum clock in!`
        )
      } else if(action == "CLOCK_OUT" && !attendance.clock_in) {
        await sendText(
          '6282115262249@s.whatsapp.net',
          `Peringatan!!, anda belum clock out!`
        )
      }
    },
    { timezone: config.TIMEZONE }
  )
}

export async function initScheduler() {
  log('=== Starting Scheduler ===')

  await ensureValidTokenData()

  log(`Scheduler config in: ${config.CLOCK_IN}`)
  log(`Scheduler config out: ${config.CLOCK_OUT}`)

  if(config.REMINDER_WA){
    reminderAttendance(config.REMINDER_CLOCK_IN, 'CLOCK_IN')
    reminderAttendance(config.REMINDER_CLOCK_OUT, 'CLOCK_OUT')
  }

  return {
    clockIn: scheduleJob(config.CLOCK_IN, 'CLOCK_IN'),
    clockOut: scheduleJob(config.CLOCK_OUT, 'CLOCK_OUT')
  }
}
