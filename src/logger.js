import { format } from 'date-fns'

const logs = []

export function log(message) {
  const time = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  
  // stringify kalau object, biar kebaca jelas
  const formattedMessage =
    typeof message === 'object'
      ? JSON.stringify(message, null, 2)
      : message

  const entry = `[${time}] ${formattedMessage}`

  logs.push(entry)
  console.log(entry)

  if (logs.length > 100) logs.shift()
}

export function getLogs() {
  return logs
}
