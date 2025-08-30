import { isAdmin } from '../../core/messageHandler.js'

const handler = async (m, { sock, args, db }) => {
  // Check if in a group
  if (!m.isGroup) {
    return m.reply(global.mess.only.group)
  }
  
  // Check if user is admin
  const isUserAdmin = await isAdmin(m.sender, m.chat, sock)
  if (!isUserAdmin) {
    return m.reply(global.mess.only.admin)
  }
  
  try {
    // Get group metadata
    const groupMetadata = await sock.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    
    // Get message
    const message = args.join(' ') || 'Mount Hua Sect Secret Assembly!'
    
    // Get all member JIDs for hidden mention
    const mentions = participants.map(p => p.id)
    
    // Send hidden tag message
    await sock.sendMessage(m.chat, { 
      text: message, 
      mentions 
    })
    
    // Add XP for using command
    await db.addUserXP(m.sender, 3)
    
  } catch (error) {
    console.error('Error in hidetag:', error)
    m.reply('This young master encountered a spiritual disturbance while executing the secret communication technique.')
  }
}

export default {
  pattern: /^(hidetag|htag|hidden)$/i,
  handler,
  help: 'Tag all members without displaying the mentions',
  usage: '/hidetag [message]',
  example: '/hidetag Secret meeting now!',
  tags: ['group'],
  group: true,
  admin: true,
  owner: false
}