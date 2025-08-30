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
  
  // Get user to ban
  let user
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    user = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (args.length > 0) {
    // Try to find by number
    const potentialNumber = args[0].replace(/[^0-9]/g, '')
    if (potentialNumber.length > 8) {
      user = potentialNumber + '@s.whatsapp.net'
    } else {
      return m.reply('Mention the disciple to be banned from this sect gathering!')
    }
  } else {
    return m.reply('Mention the disciple to be banned from this sect gathering!')
  }
  
  try {
    // Get user data
    const userData = await db.getUser(user)
    const userName = userData.name
    
    // Get group data
    const group = await db.getGroup(m.chat)
    
    // Check if unban command
    if (args.includes('unban') || args.includes('pardon')) {
      // Remove from blacklist
      const index = group.blacklisted.indexOf(user)
      if (index !== -1) {
        group.blacklisted.splice(index, 1)
        await db.updateGroup(m.chat, { blacklisted: group.blacklisted })
        
        return m.reply(`*Ban Lifted*\n\nThe disciple *${userName}* has been pardoned and may now participate in this sect gathering again.`)
      } else {
        return m.reply(`The disciple *${userName}* is not banned from this sect gathering.`)
      }
    }
    
    // Check if already banned
    if (group.blacklisted.includes(user)) {
      return m.reply(`The disciple *${userName}* is already banned from this sect gathering.`)
    }
    
    // Ban user (add to blacklist)
    group.blacklisted.push(user)
    await db.updateGroup(m.chat, { blacklisted: group.blacklisted })
    
    // Get ban reason if provided
    const reason = args.slice(1).join(' ') || 'Violating sect rules'
    
    // Kick user if bot is admin
    const botIsAdmin = await isBotAdmin(m.chat, sock)
    if (botIsAdmin) {
      await sock.groupParticipantsUpdate(m.chat, [user], 'remove')
    }
    
    // Send message
    await m.reply(`*Ban Enacted*\n\nThe disciple *${userName}* has been banned from this sect gathering.\n\n*Reason:* ${reason}\n\n_"Even the most talented disciple must respect the sect's rules."_`)
    
  } catch (error) {
    console.error('Error in ban command:', error)
    m.reply('This young master encountered a spiritual barrier. The ban technique failed.')
  }
}

export default {
  pattern: /^(ban|blacklist)$/i,
  handler,
  help: 'Ban a user from the group',
  usage: '/ban @user [reason]',
  example: '/ban @John Disrespectful behavior',
  tags: ['admin'],
  group: true,
  admin: true,
  owner: false
}