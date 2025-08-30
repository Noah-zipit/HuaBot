import { isBotAdmin, isAdmin } from '../../core/messageHandler.js'

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
  
  // Check if bot is admin
  const botIsAdmin = await isBotAdmin(m.chat, sock)
  if (!botIsAdmin) {
    return m.reply(global.mess.only.botAdmin)
  }
  
  // Get user to kick
  let user
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    user = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (args.length > 0) {
    // Try to find by number
    const potentialNumber = args[0].replace(/[^0-9]/g, '')
    if (potentialNumber.length > 8) {
      user = potentialNumber + '@s.whatsapp.net'
    } else {
      return m.reply('Mention the disciple to be expelled from the sect grounds!')
    }
  } else {
    return m.reply('Mention the disciple to be expelled from the sect grounds!')
  }
  
  try {
    // Check if user exists in group
    const groupMetadata = await sock.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    
    if (!participants.some(p => p.id === user)) {
      return m.reply('This disciple is not present in the sect grounds!')
    }
    
    // Check if the user is the bot itself
    if (user === sock.user.id) {
      return m.reply('This young master cannot expel himself. How absurd!')
    }
    
    // Check if the user is an admin
    const targetIsAdmin = participants.find(p => p.id === user)?.admin
    if (targetIsAdmin && !isOwner(m.sender)) {
      return m.reply('This young master cannot expel another sect administrator!')
    }
    
    // Get user data
    const userData = await db.getUser(user)
    const userName = userData.name
    
    // Kick user
    await sock.groupParticipantsUpdate(m.chat, [user], 'remove')
    
    // Send message
    await m.reply(`*Sect Expulsion Complete*\n\nThe disciple *${userName}* has been expelled from Mount Hua's sacred grounds.\n\n_"Those who cannot follow the sect rules have no place among us."_`)
    
  } catch (error) {
    console.error('Error in kick command:', error)
    m.reply('This young master encountered a spiritual barrier. The expulsion technique failed.')
  }
}

// Helper function to check if owner
function isOwner(jid) {
  return global.owner.some(owner => owner[0] === jid.split('@')[0])
}

export default {
  pattern: /^(kick|expel|remove)$/i,
  handler,
  help: 'Remove a user from the group',
  usage: '/kick @user',
  example: '/kick @John',
  tags: ['admin'],
  group: true,
  admin: true,
  owner: false
}