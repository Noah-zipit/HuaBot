import { isAdmin, isBotAdmin } from '../../core/messageHandler.js'

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
  
  // Get user to demote
  let user
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    user = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (args.length > 0) {
    // Try to find by number
    const potentialNumber = args[0].replace(/[^0-9]/g, '')
    if (potentialNumber.length > 8) {
      user = potentialNumber + '@s.whatsapp.net'
    } else {
      return m.reply('Mention the administrator to be demoted!')
    }
  } else {
    return m.reply('Mention the administrator to be demoted!')
  }
  
  try {
    // Get group metadata
    const groupMetadata = await sock.groupMetadata(m.chat)
    
    // Check if user is admin
    const targetParticipant = groupMetadata.participants.find(p => p.id === user)
    if (targetParticipant && !targetParticipant.admin) {
      return m.reply('This disciple is not a sect administrator!')
    }
    
    // Get user data
    const userData = await db.getUser(user)
    const userName = userData.name
    
    // Demote user
    await sock.groupParticipantsUpdate(m.chat, [user], 'demote')
    
    // Send success message
    await m.reply(`*Demotion Ceremony Complete*\n\nThe administrator *${userName}* has been relieved of their duties and returned to the ranks of regular disciples.\n\n_"Even the mighty can fall. Let this be a lesson in humility."_`)
    
  } catch (error) {
    console.error('Error in demote command:', error)
    m.reply('This young master encountered a spiritual barrier. The demotion technique failed.')
  }
}

export default {
  pattern: /^(demote|unadmin|demotion)$/i,
  handler,
  help: 'Demote a group admin to regular member',
  usage: '/demote @user',
  example: '/demote @John',
  tags: ['admin'],
  group: true,
  admin: true,
  owner: false
}