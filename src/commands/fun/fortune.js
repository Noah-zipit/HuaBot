const handler = async (m, { sock, db }) => {
  try {
    // Get user data
    const user = await db.getUser(m.sender)
    
    // Arrays for fortune telling
    const fortunes = [
      "Your cultivation shall advance rapidly in the coming month. Focus on your sword technique.",
      "Beware the third day of next week. A challenge to your pride approaches.",
      "A great opportunity for spiritual advancement will come from an unexpected source. Keep your eyes open.",
      "Your spiritual energy is clouded. Fast for three days to purify your meridians.",
      "A potential cultivation partner will cross your path. They may appear ordinary but hold extraordinary potential.",
      "The stars indicate a bottleneck in your cultivation. Meditate under the full moon to breakthrough.",
      "Your luck in acquiring spiritual treasures is exceptional this month. Seek ancient ruins.",
      "Danger lurks in flowing water. Avoid rivers and lakes until the next full moon.",
      "A senior will recognize your talent soon. Be prepared to demonstrate your skills.",
      "Your mind is scattered. Practice the Nine Serenities Technique for seven days to focus your thoughts.",
      "A betrayal from someone close is imminent. Guard your cultivation secrets carefully.",
      "Your spiritual foundation shows promise. Focusing on basics now will yield tenfold returns later.",
      "A rare herb essential for your next breakthrough will appear in the market soon. Do not hesitate to acquire it.",
      "Your fortune in combat is favorable. Challenge a worthy opponent to advance your techniques.",
      "The color red brings you good fortune this month. Incorporate it into your daily attire."
    ]
    
    const advice = [
      "Focus on strengthening your foundation before attempting advanced techniques.",
      "True strength comes from understanding your weaknesses.",
      "Sharpen your sword daily, but sharpen your mind hourly.",
      "The path to immortality is paved with countless hardships. Embrace them.",
      "A true cultivator sees opportunity in every setback.",
      "To master others requires force; to master yourself requires strength.",
      "The greatest enemy you'll face is not other cultivators, but your own complacency.",
      "Three things cannot long be hidden: the sun, the moon, and the truth of your cultivation.",
      "Before seeking spiritual treasures abroad, discover the ones hidden within.",
      "A moment of patience in a moment of anger saves a hundred days of sorrow.",
      "Even Mount Hua was once a small hill. Greatness requires time and persistence.",
      "The sword may conquer the mountain, but even the mightiest blade cannot cut water.",
      "Respect your seniors, guide your juniors, and never cease to cultivate yourself."
    ]
    
    // Select random fortune and advice
    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)]
    const cultivationAdvice = advice[Math.floor(Math.random() * advice.length)]
    
    // Calculate lucky numbers based on user's stats
    const luckyNumber = Math.floor(user.cultivation.xp % 81) + 1
    const unluckyNumber = (luckyNumber + 40) % 81 + 1
    
    // Determine lucky element based on user ID
    const elements = ['Fire', 'Water', 'Earth', 'Wood', 'Metal']
    const luckyElement = elements[parseInt(m.sender.substring(3, 6)) % 5]
    
    // Format fortune message
    const fortuneText = `
*༺ MOUNT HUA FORTUNE DIVINATION ༻*

*Disciple:* ${user.name}
*Current Cultivation:* ${user.cultivation.stage}

*Fortune Prediction:*
${fortune}

*Cultivation Advice:*
${cultivationAdvice}

*Lucky Number:* ${luckyNumber}
*Unlucky Number:* ${unluckyNumber}
*Auspicious Element:* ${luckyElement}

_"Fortune favors not just the bold, but the consistently diligent."_
`
    
    // Send fortune
    m.reply(fortuneText)
    
    // Add XP for using command
    await db.addUserXP(m.sender, 4)
    
  } catch (error) {
    console.error('Error in fortune command:', error)
    m.reply('This young master\'s divination abilities are being disrupted by malevolent spiritual energy. Try again later.')
  }
}

export default {
  pattern: /^(fortune|divination|fate|predict)$/i,
  handler,
  help: 'Get your cultivation fortune and advice',
  tags: ['fun'],
  group: false,
  admin: false,
  owner: false
}