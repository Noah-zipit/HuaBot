import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, jidDecode } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Create sessions directory
const sessionDir = path.join(__dirname, '../../sessions')
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true })
}

// Create tmp directory
const tmpDir = path.join(__dirname, '../../tmp')
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true })
}

/**
 * Initialize WhatsApp connection
 */
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
  
  // Set up logger
  const logger = pino({ 
    level: 'silent',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  })
  
  // Create WhatsApp connection
  const sock = makeWASocket({
    logger,
    printQRInTerminal: true,
    auth: state,
    browser: ['HuaBot', 'Chrome', '1.0.0'],
  })
  
  // Set up connection event handling
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      
      console.log('Connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect)
      
      if (shouldReconnect) {
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      console.log('Connected to WhatsApp')
    }
  })
  
  // Save credentials on update
  sock.ev.on('creds.update', saveCreds)
  
  // Helper function to decode JID
  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return decode.user && decode.server && decode.user + '@' + decode.server || jid
    } else return jid
  }
  
  // Helper function to get name from JID
  sock.getName = (jid, withoutContact = false) => {
    if (!jid) return jid
    
    let id = sock.decodeJid(jid)
    
    withoutContact = sock.withoutContact || withoutContact
    
    let v
    if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
      v = sock.contacts[id] || {}
      if (!(v.name || v.subject)) v = await sock.groupMetadata(id) || {}
      resolve(v.name || v.subject || 'Unknown Group')
    })
    else v = id === '0@s.whatsapp.net' ? {
      id,
      name: 'WhatsApp'
    } : id === sock.decodeJid(sock.user.id) ?
      sock.user :
      (sock.contacts[id] || {})
    
    return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || v.notify || v.vname || 'Unknown'
  }
  
  return sock
}

export { connectToWhatsApp }