import http from 'http'
import { initScheduler } from './src/scheduler.js'
import { getLogs, log } from './src/logger.js'
import { getCompanyId } from './src/talentaService.js'
import { initWA } from './src/whatsapp/socket.js'
import { getSocket } from './src/whatsapp/socket.js'
import { sendText } from './src/whatsapp/sender.js'
import { config } from './src/config.js'

const PORT = process.env.PORT || 3000
let scheduler = null

async function startApp() {
  console.log('=== Starting Attendance Scheduler ===')
  scheduler = await initScheduler()

  http
    .createServer(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })

      if (req.url === "/company") {
        const company = await getCompanyId()
        res.end(JSON.stringify(company))
      }

      if (req.url === '/logs') {
        const data = getLogs().join('\n')
        res.end(data || 'No logs yet.\n')
        return
      }
      if (req.url === '/stop') {
        if (scheduler == null) {
          res.end('Attendance is already stop\n')
          return
        }

        scheduler.clockIn.stop()
        scheduler.clockOut.stop()

        scheduler = null
        log('Stop schedule manually')
        res.end('Attendance is stop running\n')
        return
      }
      if (req.url === '/start') {
        if (scheduler != null) {
          res.end('Attendance is already start\n')
          return
        }
        scheduler = await initScheduler()
        log('Start schedule manually')
        res.end('Attendance is start running\n')
        return
      }

      let response = "Schedule is running"

      if (scheduler == null) {
        response = "Schedule is stop"
      }

      res.end(`${response}\n`)
    })
    .listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`)
    })
}

if(config.REMINDER_WA){
  await initWA()

  const sock = getSocket()

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJidAlt
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if(from == "6282115262249@s.whatsapp.net"){
      if (text == '/stop') {
        if (scheduler == null) {
          await sendText(
            '6282115262249@s.whatsapp.net',
            `Attendance is already stop!`
          )
          return
        }

        scheduler.clockIn.stop()
        scheduler.clockOut.stop()

        scheduler = null
        log('Stop schedule manually')
        await sendText(
            '6282115262249@s.whatsapp.net',
            `Attendance stoped!`
        )
        return
      }

      if (text == '/start') {
        if (scheduler != null) {
          await sendText(
            '6282115262249@s.whatsapp.net',
            `Attendance is already start!`
          )
          return
        }
        scheduler = await initScheduler()
        log('Start schedule manually')
        await sendText(
            '6282115262249@s.whatsapp.net',
            `Attendance start!`
        )
        return
      }


      if (text == '/status') {
        if (scheduler != null) {
          await sendText(
            '6282115262249@s.whatsapp.net',
            `Attendance status: running!`
          )
          return
        }
        await sendText(
            '6282115262249@s.whatsapp.net',
            `Attendance status: stoped!`
        )
        return
      }
    }
  })
}
startApp()
