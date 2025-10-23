import { format } from 'date-fns'

const logs = []

export function log(message) {
  const time = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  const entry = `[${time}] ${message}`
  logs.push(entry)
  console.log(entry)
  if (logs.length > 100) logs.shift()
}

export function getLogs() {
  return logs
}