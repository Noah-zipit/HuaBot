import { isAdmin } from '../../core/messageHandler.js'
import { parseTimeString, formatTime } from '../../core/utils.js'

const handler = async (m, { sock, args, db }) => {
  // Check if in group
  if (!m.isGroup) {
    return m.reply(global.mess.only.group)
  }
  
  // Check if user is admin
  const isUserAdmin = await isAdmin(m.sender, m.chat, sock)
  if (!isUserAdmin) {
    return m.reply(global.mess.only.admin)
  }
  
  try {
    // Get group data
    const group = await db.getGroup(m.chat)
    
    // Check for unmute command
    if (args[0] === 'off' || args[0] === 'unmute') {
      if (!group.muted) {
        return m.reply('This sect gathering is not silenced.')
      }
      
      // Unmute the group
      await db.updateGroup(m.chat, { muted: false })
      
      return m.reply('*Silencing Technique Released*\n\nDisciples may now speak freely in this gathering.')
    }
    
    // If no arguments and already muted, show status
    if (args.length === 0 && group.muted) {
      return m.reply('This sect gathering is currently silenced. Only administrators may speak.')
    }
    
    // If no arguments and not muted, mute indefinitely
    if (args.length === 0) {
      await db.updateGroup(m.chat, { muted: true })
      
      return m.reply('*Silencing Technique Applied*\n\nThis sect gathering has been silenced. Only administrators may speak now.')
    }
    
    // Parse time if provided (e.g., 30m, 1h, etc.)
    const timeStr = args[0]
    const durationMs = parseTimeString(timeStr)
    
    if (durationMs > 0) {
      // Set mute with expiry
      const expiryTime = Date.now() + durationMs
      
      await db.updateGroup(m.chat, { 
        muted: true,
        muteExpires: expiryTime
      })
      
      // Format duration for message
      const duration = formatTime(durationMs / 1000)
      
      return m.reply(`*Temporary Silencing Technique Applied*\n\nThis sect gathering has been silenced for *${duration}*. Only administrators may speak during this period.`)
    } else {
      // Indefinite mute
      await db.updateGroup(m.chat, { muted: true })
      
      return m.reply('*Silencing Technique Applied*\n\nThis sect gathering has been silenced. Only administrators may speak now.')
    }
    
  } catch (error) {
    console.error('Error in mute command:', error)
    m.reply('This young master encountered a spiritual barrier. The silencing technique failed.')
  }
}

export default {
  pattern: /^(mute|silence|quiet)$/i,
  handler,
  help: 'Mute the group chat',
  usage: '/mute [duration]',
  example: '/mute 30m',
  tags: ['admin'],
  group: true,
  admin: true,
  owner: false
}