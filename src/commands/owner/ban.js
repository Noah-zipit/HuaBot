const handler = async (m, { sock, args, db }) => {
  // Get user to ban
  let user
  let reason = 'Violating sect rules'
  
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    user = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    reason = args.join(' ') || reason
  } else if (args.length > 0) {
    // Try to find by number
    const potentialNumber = args[0].replace(/[^0-9]/g, '')
    if (potentialNumber.length > 8) {
      user = potentialNumber + '@s.whatsapp.net'
      reason = args.slice(1).join(' ') || reason
    } else {
      return m.reply('Specify which disciple should be banned from using Mount Hua techniques.')
    }
  } else {
    return m.reply('Specify which disciple should be banned from using Mount Hua techniques.')
  }
  
  try {
    // Get user data
    const userData = await db.getUser(user)
    const userName = userData.name
    
    // Check if user is already banned
    if (args[0]?.toLowerCase() === 'unban' || args[1]?.toLowerCase() === 'unban' || args.includes('unban')) {
      // Unban user
      await db.updateUser(user, { banned: false, banReason: '' })
      
      return m.reply(`*Ban Lifted*\n\nThe disciple *${userName}* has been granted redemption by the Sect Master.\n\nThey may once again access Mount Hua's techniques.`)
    }
    
    // Ban user
    await db.updateUser(user, { banned: true, banReason: reason })
    
    m.reply(`*Spiritual Ban Enacted*\n\nThe disciple *${userName}* has been banned from using Mount Hua techniques.\n\n*Reason:* ${reason}\n\n_"Those who violate sect rules face severe consequences."_`)
    
    // Notify the banned user
    try {
      await sock.sendMessage(user, {
        text: `*You Have Been Banned*\n\nBy the authority of the Sect Master, you have been banned from using Mount Hua Bot techniques.\n\n*Reason:* ${reason}\n\n_"Reflect upon your actions and seek redemption."_`
      })
    } catch (err) {
      console.error('Error notifying banned user:', err)
    }
    
  } catch (error) {
    console.error('Error in ban command:', error)
    m.reply('This young master encountered a spiritual barrier. The ban technique failed.')
  }
}

export default {
  pattern: /^(globalban|gban|banuser)$/i,
  handler,
  help: 'Ban or unban a user from using the bot',
  usage: '/globalban @user [reason]',
  example: '/globalban @John Disrespectful behavior',
  tags: ['owner'],
  group: false,
  admin: false,
  owner: true
}