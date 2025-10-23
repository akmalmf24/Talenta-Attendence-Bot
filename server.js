import http from 'http'
import { initScheduler } from './src/scheduler.js'
import { getLogs, log } from './src/logger.js'

const PORT = process.env.PORT || 3000
let scheduler = null

async function startApp () {
  console.log('=== Starting Attendance Scheduler ===')
  scheduler = await initScheduler()

  http
    .createServer(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })

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

      res.end('Server is running\n')
    })
    .listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`)
    })
}

startApp()
