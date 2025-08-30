import { downloadMediaMessage } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.join(__dirname, '../../tmp')

/**
 * Main message handler
 */
export async function handleMessage(message, sock, db) {
  // Check if this is a message
  if (!message.message) return
  
  // Parse the message
  const m = await parseMessage(message, sock)
  if (!m) return
  
  // Skip status broadcast messages
  if (m.key.remoteJid === 'status@broadcast') return
  
  // Track message
  await db.trackMessage(m.sender, m.chat)
  
  // Log incoming message
  console.log(`[MSG] ${m.pushName} (${m.sender.split('@')[0]}): ${m.body || m.type}`)
  
  // Check maintenance mode
  const maintenanceMode = await db.getSetting('maintenanceMode')
  if (maintenanceMode?.enabled && !isOwner(m.sender)) {
    m.reply(`*Mount Hua Sect is in Closed-Door Cultivation*\n\nReason: ${maintenanceMode.reason}\n\n_Please wait until the Sect Master completes maintenance._`)
    return
  }
  
  // Check if user is banned
  const user = await db.getUser(m.sender)
  if (user.banned && !isOwner(m.sender)) {
    m.reply(`*Access Denied*\n\nYou have been banned from using Mount Hua techniques.\n\nReason: ${user.banReason || 'Violating sect rules'}`)
    return
  }
  
  // Process command if this is a command
  if (m.body && m.body.startsWith('/')) {
    const [command, ...args] = m.body.slice(1).trim().split(/\s+/)
    
    // Get all plugins
    const plugins = global.plugins || {}
    
    // Find matching plugin for this command
    for (let plugin in plugins) {
      const { pattern, handler, owner, admin, group, premium } = plugins[plugin]
      
      if (pattern && pattern.test(command)) {
        // Check permissions
        if (owner && !isOwner(m.sender)) {
          m.reply('This technique is only for the Sect Master.')
          return
        }
        
        if (premium && !user.isPremium) {
          m.reply('This technique is only for core disciples. Improve your cultivation to gain access.')
          return
        }
        
        if (admin && !await isAdmin(m.sender, m.chat, sock)) {
          m.reply('This technique is only for Sect Administrators.')
          return
        }
        
        if (group && !m.isGroup) {
          m.reply('This technique can only be used within the Sect grounds.')
          return
        }
        
        try {
          // Track command usage
          await db.trackCommand(command, m.sender)
          
          // Execute the command handler
          await handler(m, { sock, args, db })
        } catch (e) {
          console.error('Error executing command:', e)
          m.reply(`Error: ${e.message}`)
        }
        
        break
      }
    }
  }
}

/**
 * Parse incoming WhatsApp message
 */
async function parseMessage(message, sock) {
  // Get the message content
  const m = {}
  const types = Object.keys(message.message || {})
  
  m.message = message
  m.key = message.key
  m.sender = sock.decodeJid(message.key.remoteJid === 'status@broadcast' ? message.key.participant : message.key.fromMe ? sock.user.id : message.key.remoteJid)
  m.chat = sock.decodeJid(message.key.remoteJid)
  m.fromMe = message.key.fromMe
  m.isGroup = m.chat.endsWith('@g.us')
  m.pushName = message.pushName || 'Unknown'
  
  // Extract message type and body
  m.type = types[0]
  if (['conversation', 'extendedTextMessage'].includes(m.type)) {
    m.body = message.message[m.type].text || ''
  } else if (m.type === 'imageMessage') {
    m.body = message.message[m.type].caption || ''
  } else if (m.type === 'videoMessage') {
    m.body = message.message[m.type].caption || ''
  } else {
    m.body = ''
  }
  
  // Get quoted message if any
  if (m.type === 'extendedTextMessage' && message.message.extendedTextMessage.contextInfo?.quotedMessage) {
    m.quoted = {
      message: message.message.extendedTextMessage.contextInfo.quotedMessage,
      sender: sock.decodeJid(message.message.extendedTextMessage.contextInfo.participant),
      type: Object.keys(message.message.extendedTextMessage.contextInfo.quotedMessage)[0]
    }
  }
  
  // Add reply function
  m.reply = (text) => {
    sock.sendMessage(m.chat, { text }, { quoted: message })
  }
  
  // Add react function
  m.react = (emoji) => {
    sock.sendMessage(m.chat, {
      react: {
        text: emoji,
        key: message.key
      }
    })
  }
  
  // Add download function for media messages
  if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'].includes(m.type)) {
    m.download = async () => {
      try {
        const buffer = await downloadMediaMessage(
          message,
          'buffer',
          {},
          {
            logger: console
          }
        )
        
        // Save to tmp folder
        const fileName = `${Date.now()}.${m.type.replace('Message', '')}`
        const filePath = path.join(tmpDir, fileName)
        
        fs.writeFileSync(filePath, buffer)
        
        return {
          buffer,
          fileName,
          filePath
        }
      } catch (e) {
        console.error('Error downloading media:', e)
        return null
      }
    }
  }
  
  return m
}

/**
 * Check if user is an owner
 */
function isOwner(jid) {
  return global.owner.some(owner => owner[0] === jid.split('@')[0])
}

/**
 * Check if user is an admin
 */
async function isAdmin(jid, groupJid, sock) {
  if (!groupJid.endsWith('@g.us')) return false
  
  try {
    const groupMetadata = await sock.groupMetadata(groupJid)
    const participant = groupMetadata.participants.find(p => p.id === jid)
    return participant && ['admin', 'superadmin'].includes(participant.admin)
  } catch (e) {
    console.error('Error checking admin status:', e)
    return false
  }
}

/**
 * Check if bot is admin
 */
async function isBotAdmin(groupJid, sock) {
  if (!groupJid.endsWith('@g.us')) return false
  
  try {
    const groupMetadata = await sock.groupMetadata(groupJid)
    const botJid = sock.user.id.replace(/:\d+/, '')
    const participant = groupMetadata.participants.find(p => p.id.startsWith(botJid))
    return participant && ['admin', 'superadmin'].includes(participant.admin)
  } catch (e) {
    console.error('Error checking bot admin status:', e)
    return false
  }
}

export { isOwner, isAdmin, isBotAdmin }