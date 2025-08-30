import { formatTime, parseTimeString } from '../../core/utils.js'

const handler = async (m, { sock, args, db }) => {
  // Get target user
  let targetJid
  
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (args.length > 0) {
    // Try to find by number
    const potentialNumber = args[0].replace(/[^0-9]/g, '')
    if (potentialNumber.length > 8) {
      targetJid = potentialNumber + '@s.whatsapp.net'
    } else {
      return m.reply('Specify which disciple should be granted core disciple status.')
    }
  } else {
    return m.reply('Specify which disciple should be granted core disciple status.')
  }
  
  try {
    // Get user data
    const user = await db.getUser(targetJid)
    const userName = user.name
    
    // Check for removal
    if (args.includes('remove') || args.includes('delete') || args.includes('revoke')) {
      await db.updateUser(targetJid, { 
        isPremium: false,
        premiumExpires: null
      })
      
      return m.reply(`*Core Disciple Status Revoked*\n\nThe disciple *${userName}* has been demoted from core disciple status.\n\nThey will no longer have access to exclusive Mount Hua techniques.`)
    }
    
    // Parse duration
    let duration = 30 // Default 30 days
    
    // Look for time arguments (e.g. 7d, 1m, etc.)
    for (let i = 1; i < args.length; i++) {
      if (args[i].match(/^\d+[dhm]$/)) {
        const unit = args[i].slice(-1)
        const value = parseInt(args[i].slice(0, -1))
        
        if (unit === 'd') {
          duration = value
        } else if (unit === 'm') {
          duration = value * 30
        } else if (unit === 'h') {
          duration = value / 24
        }
        break
      } else if (/^\d+$/.test(args[i])) {
        duration = parseInt(args[i])
        break
      }
    }
    
    // Calculate expiry
    const expiry = Date.now() + (duration * 24 * 60 * 60 * 1000)
    
    // Update user
    await db.updateUser(targetJid, {
      isPremium: true,
      premiumExpires: expiry
    })
    
    m.reply(`*Core Disciple Status Granted*\n\nThe disciple *${userName}* has been elevated to core disciple status for *${duration} days*.\n\nExpires: *${new Date(expiry).toDateString()}*\n\n_"With great power comes access to Mount Hua's secret techniques."_`)
    
    // Notify the user
    try {
      await sock.sendMessage(targetJid, {
        text: `*Congratulations, Disciple ${userName}!*\n\nYou have been granted core disciple status by the Sect Master for *${duration} days*.\n\nYou now have access to exclusive Mount Hua techniques.\n\n_"Prove yourself worthy of this honor."_`
      })
    } catch (err) {
      console.error('Error notifying premium user:', err)
    }
    
  } catch (error) {
    console.error('Error in premium command:', error)
    m.reply('This young master encountered a spiritual disturbance while modifying disciple status.')
  }
}

export default {
  pattern: /^(premium|core|coredisciple)$/i,
  handler,
  help: 'Add or remove premium/core disciple status',
  usage: '/premium @user [days/remove]',
  example: '/premium @John 30',
  tags: ['owner'],
  group: false,
  admin: false,
  owner: true
}