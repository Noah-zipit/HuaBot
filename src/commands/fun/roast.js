const handler = async (m, { sock, args, db }) => {
  // Get the target of the roast
  let target
  let targetName
  
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    // If someone was mentioned
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    const user = await db.getUser(target)
    targetName = user.name
  } else if (args.length > 0) {
    // If a name was provided
    targetName = args.join(' ')
  } else {
    // No target specified
    return m.reply('Mention a disciple for this young master to evaluate their inadequacies!')
  }
  
  try {
    // Array of Mount Hua style roasts
    const roasts = [
      `*${targetName}* is so weak, even breathing constitutes as their daily cultivation exercise!`,
      
      `This young master has seen more potential in a rock than in *${targetName}*. At least the rock doesn't waste spiritual energy!`,
      
      `*${targetName}*'s sword technique is so sloppy, they would lose to a child wielding a branch!`,
      
      `If Mount Hua accepted *${targetName}* as a disciple, this young master would immediately defect to the Southern Edge Sect!`,
      
      `*${targetName}*'s cultivation base is so shallow, a puddle after rain has more depth!`,
      
      `The heavens granted *${targetName}* the face of a celestial being but the talent of a barnyard chicken!`,
      
      `*${targetName}* practices so diligently yet improves so little. It's like watching an ant try to drain the ocean!`,
      
      `This young master has seen *${targetName}* wield a sword. It resembles an old woman swatting flies with a fan!`,
      
      `*${targetName}*'s understanding of the Dao is so limited, they couldn't comprehend a children's cultivation manual!`,
      
      `If stupidity could be converted to spiritual energy, *${targetName}* would have ascended to immortality ages ago!`,
      
      `*${targetName}*'s spiritual sense is so dull, they would miss a Spirit Beast even if it danced naked before them!`,
      
      `The only thing more fragile than *${targetName}*'s cultivation foundation is their ego!`,
      
      `This young master has heard that *${targetName}* once tried to refine a pill. The sect is still rebuilding the alchemy room!`
    ]
    
    // Select a random roast
    const roast = roasts[Math.floor(Math.random() * roasts.length)]
    
    // Send the roast
    await m.reply(`*༺ MOUNT HUA EVALUATION ༻*\n\n${roast}\n\n_"True cultivation begins with recognizing one's inadequacies."_`)
    
    // Add XP for using command
    await db.addUserXP(m.sender, 5)
    
  } catch (error) {
    console.error('Error in roast command:', error)
    m.reply('This young master cannot be bothered to evaluate such an insignificant disciple.')
  }
}

export default {
  pattern: /^(roast|evaluate|judge|criticize)$/i,
  handler,
  help: 'Have Chung Myeong evaluate a disciple\'s inadequacies',
  usage: '/roast @user',
  example: '/roast @John',
  tags: ['fun'],
  group: false,
  admin: false,
  owner: false
}