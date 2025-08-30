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
    
    // Get custom message if provided
    let message = args.join(' ') || 'Mount Hua Sect Assembly! All disciples report at once!'
    
    // Format mentions
    let mentions = []
    let text = `*༺ MOUNT HUA ASSEMBLY ༻*\n\n${message}\n\n`
    
    participants.forEach((participant, i) => {
      text += `${i+1}. @${participant.id.split('@')[0]}\n`
      mentions.push(participant.id)
    })
    
    text += '\n_"When the sect calls, true disciples answer without hesitation."_'
    
    // Send message with mentions
    await sock.sendMessage(m.chat, { 
      text, 
      mentions 
    })
    
    // Add XP for using command
    await db.addUserXP(m.sender, 5)
    
  } catch (error) {
    console.error('Error in tagall:', error)
    m.reply('This young master encountered a spiritual disturbance while gathering the disciples.')
  }
}

export default {
  pattern: /^(tagall|everyone|all|assembly)$/i,
  handler,
  help: 'Mention all group members',
  usage: '/tagall [message]',
  example: '/tagall Urgent meeting now!',
  tags: ['group'],
  group: true,
  admin: true,
  owner: false
}