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
  
  // Get user to promote
  let user
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    user = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (args.length > 0) {
    // Try to find by number
    const potentialNumber = args[0].replace(/[^0-9]/g, '')
    if (potentialNumber.length > 8) {
      user = potentialNumber + '@s.whatsapp.net'
    } else {
      return m.reply('Mention the disciple to be promoted to sect administrator!')
    }
  } else {
    return m.reply('Mention the disciple to be promoted to sect administrator!')
  }
  
  try {
    // Get group metadata
    const groupMetadata = await sock.groupMetadata(m.chat)
    
    // Check if user is already admin
    const targetParticipant = groupMetadata.participants.find(p => p.id === user)
    if (targetParticipant && targetParticipant.admin) {
      return m.reply('This disciple is already a sect administrator!')
    }
    
    // Get user data
    const userData = await db.getUser(user)
    const userName = userData.name
    
    // Promote user
    await sock.groupParticipantsUpdate(m.chat, [user], 'promote')
    
    // Send success message
    await m.reply(`*Promotion Ceremony Complete*\n\nThe disciple *${userName}* has been elevated to the rank of sect administrator.\n\n_"With great power comes great responsibility. Use it wisely."_`)
    
  } catch (error) {
    console.error('Error in promote command:', error)
    m.reply('This young master encountered a spiritual barrier. The promotion technique failed.')
  }
}

export default {
  pattern: /^(promote|admin|elevation)$/i,
  handler,
  help: 'Promote a user to group admin',
  usage: '/promote @user',
  example: '/promote @John',
  tags: ['admin'],
  group: true,
  admin: true,
  owner: false
}