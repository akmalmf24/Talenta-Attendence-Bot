import { getSocket } from './socket.js'

export function listenMessage() {
  const sock = getSocket()

  sock.ev.on('messages.upsert', ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    console.log('Pesan masuk:', from, text)
  })
}
