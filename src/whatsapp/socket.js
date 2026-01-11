import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from 'baileys'
import qrcode from 'qrcode-terminal'
import { Boom } from '@hapi/boom'

let sock = null

export async function initWA() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

  sock = makeWASocket({
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      console.log('WA closed:', reason)
    }

    if (connection === 'open') {
      console.log('WhatsApp connected ✅')
    }
  })

  return sock
}

export function getSocket() {
  if (!sock) throw new Error('WA socket not initialized')
  return sock
}
