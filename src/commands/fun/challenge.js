const handler = async (m, { sock, args, db }) => {
  try {
    // Get target user
    let targetJid = null
    let targetName = 'disciple'
    
    if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
      const user = await db.getUser(targetJid)
      targetName = user.name
    } else if (args.length > 0) {
      targetName = args.join(' ')
    }
    
    // Get user data
    const user = await db.getUser(m.sender)
    
    // Array of cultivation challenges
    const challenges = [
      `${targetName} must meditate for 10 minutes in complete silence.`,
      `${targetName} must send an audio recording reciting Mount Hua's foundational scripture.`,
      `${targetName} must send a martial arts pose image within 5 minutes.`,
      `${targetName} must create a 4-line poem about the cultivation path.`,
      `${targetName} must stand on one leg for 3 minutes, then send proof.`,
      `${targetName} must refrain from sending messages for 30 minutes, cultivating inner peace.`,
      `${targetName} must compliment three disciples in this sect gathering.`,
      `${targetName} must speak only in third-person like this young master for the next hour.`,
      `${targetName} must share a story about their cultivation journey so far.`,
      `${targetName} must draw the Mount Hua sect symbol and share it.`,
      `${targetName} must record themselves performing a basic sword technique.`,
      `${targetName} must find and share an inspirational quote about perseverance.`,
      `${targetName} must go outside and take a picture of the sky, connecting with nature's energy.`,
      `${targetName} must drink a full cup of water without stopping to properly hydrate their cultivation base.`,
      `${targetName} must describe their ideal Immortal Paradise in vivid detail.`
    ]
    
    // Select a random challenge
    const challenge = challenges[Math.floor(Math.random() * challenges.length)]
    
    // Format challenge message
    const challengeText = `
*༺ MOUNT HUA CHALLENGE ༻*

This young master issues a cultivation challenge!

*Challenged Disciple:* ${targetName}
*Challenge:* ${challenge}

_"True growth comes from pushing beyond your comfort zone."_
`
    
    // Send challenge
    m.reply(challengeText)
    
    // Tag the target if it's a valid user
    if (targetJid) {
      sock.sendMessage(m.chat, { 
        text: `@${targetJid.split('@')[0]}, do you accept this challenge?`,
        mentions: [targetJid]
      })
    }
    
    // Add XP for using command
    await db.addUserXP(m.sender, 5)
    
  } catch (error) {
    console.error('Error in challenge command:', error)
    m.reply('This young master encountered a spiritual disturbance while crafting a challenge.')
  }
}

export default {
  pattern: /^(challenge|task|dare)$/i,
  handler,
  help: 'Issue a cultivation challenge to another disciple',
  usage: '/challenge @user',
  example: '/challenge @John',
  tags: ['fun'],
  group: false,
  admin: false,
  owner: false
}