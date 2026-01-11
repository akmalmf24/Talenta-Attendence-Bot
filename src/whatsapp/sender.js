import { getSocket } from './socket.js'

export async function sendText(jid, text) {
  const sock = getSocket()

  return sock.sendMessage(jid, { text })
}
