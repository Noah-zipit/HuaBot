const handler = async (m, { sock, args, db }) => {
  try {
    if (args.length === 0) {
      return m.reply('You must provide an answer to the riddle!')
    }
    
    // Get user data
    const user = await db.getUser(m.sender)
    
    // Check if user has an active riddle
    if (!user.currentRiddle) {
      return m.reply('You have no active riddle to answer! Use /riddle to get a new one.')
    }
    
    // Check if riddle is expired (30 minutes)
    const riddleAge = Date.now() - user.currentRiddle.timestamp
    if (riddleAge > 30 * 60 * 1000) {
      await db.updateUser(m.sender, { currentRiddle: null })
      return m.reply('Your riddle has expired! Use /riddle to get a new one.')
    }
    
    // Get user's answer
    const userAnswer = args.join(' ').toLowerCase()
    
    // Check answer
    const correctAnswer = user.currentRiddle.answer.toLowerCase()
    const isCorrect = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)
    
    if (isCorrect) {
      // Correct answer
      const xpReward = 10
      await db.addUserXP(m.sender, xpReward)
      
      // Clear the current riddle
      await db.updateUser(m.sender, { currentRiddle: null })
      
      return m.reply(`*Correct Answer!*\n\nYour wisdom impresses this young master. The answer indeed is: *${user.currentRiddle.answer}*\n\nYou have been rewarded with *${xpReward}* cultivation points.\n\n_"Knowledge is the key that unlocks the gates of immortality."_`)
    } else {
      // Wrong answer
      return m.reply(`*Incorrect!*\n\nYour understanding is still shallow. Meditate further on the riddle:\n\n"${user.currentRiddle.question}"\n\n_"Even failures bring enlightenment to those who reflect."_`)
    }
    
  } catch (error) {
    console.error('Error in answer command:', error)
    m.reply('This young master encountered a spiritual disturbance while evaluating your answer.')
  }
}

export default {
  pattern: /^(answer|solve|solution)$/i,
  handler,
  help: 'Answer a riddle from the /riddle command',
  usage: '/answer [your answer]',
  example: '/answer meditation',
  tags: ['fun'],
  group: false,
  admin: false,
  owner: false
}