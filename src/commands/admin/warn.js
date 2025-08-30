import { isAdmin } from '../../core/messageHandler.js'

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
  
  // Get user to warn
  let user
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    user = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (args.length > 0) {
    // Try to find by number
    const potentialNumber = args[0].replace(/[^0-9]/g, '')
    if (potentialNumber.length > 8) {
      user = potentialNumber + '@s.whatsapp.net'
    } else {
      return m.reply('Mention the disciple to be warned!')
    }
  } else {
    return m.reply('Mention the disciple to be warned!')
  }
  
  try {
    // Check if trying to warn bot
    if (user === sock.user.id) {
      return m.reply('This young master cannot warn himself. What foolishness!')
    }
    
    // Check if trying to warn an admin
    const isTargetAdmin = await isAdmin(user, m.chat, sock)
    if (isTargetAdmin) {
      return m.reply('This young master cannot warn another sect administrator!')
    }
    
    // Get warning reason if provided
    const reason = args.slice(1).join(' ') || 'Violating sect rules'
    
    // Get user data
    const userData = await db.getUser(user)
    const userName = userData.name
    
    // Increment warnings
    userData.warnings = (userData.warnings || 0) + 1
    await db.updateUser(user, { warnings: userData.warnings })
    
    // Determine action based on warning count
    let actionText = ''
    if (userData.warnings >= 3) {
      // Reset warnings
      await db.updateUser(user, { warnings: 0 })
      
      // Kick if bot is admin
      const botIsAdmin = await isBotAdmin(m.chat, sock)
      if (botIsAdmin) {
        await sock.groupParticipantsUpdate(m.chat, [user], 'remove')
        actionText = 'They have been expelled from the sect for accumulating 3 warnings.'
      } else {
        actionText = 'They have accumulated 3 warnings and should be expelled, but this young master lacks the authority.'
      }
    } else {
      actionText = `They now have ${userData.warnings}/3 warnings.`
    }
    
    // Send warning message
    await m.reply(`*Warning Issued*\n\nThe disciple *${userName}* has been warned.\n\n*Reason:* ${reason}\n\n${actionText}\n\n_"Three strikes, and one is expelled from Mount Hua."_`)
    
    // Notify the warned user
    try {
      await sock.sendMessage(user, {
        text: `*You Have Been Warned*\n\nYou have received a warning in the group "${(await sock.groupMetadata(m.chat)).subject}".\n\n*Reason:* ${reason}\n\n*Warning Count:* ${userData.warnings}/3\n\n_"Reflect on your actions, or face expulsion from Mount Hua."_`
      })
    } catch (err) {
      console.error('Error notifying warned user:', err)
    }
    
  } catch (error) {
    console.error('Error in warn command:', error)
    m.reply('This young master encountered a spiritual barrier. The warning technique failed.')
  }
}

// Helper function to check if bot is admin
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

export default {
  pattern: /^(warn|warning)$/i,
  handler,
  help: 'Warn a user for rule violations',
  usage: '/warn @user [reason]',
  example: '/warn @John Spamming in the group',
  tags: ['admin'],
  group: true,
  admin: true,
  owner: false
}