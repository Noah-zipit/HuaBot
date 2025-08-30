const handler = async (m, { sock, args, db }) => {
  try {
    // Need at least two people to ship
    if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length < 2 && args.length < 2) {
      return m.reply('You must mention or name two disciples to calculate their compatibility!')
    }
    
    // Get the two people to ship
    let person1, person2
    let person1Name, person2Name
    
    if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length >= 2) {
      // Two people are mentioned
      person1 = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
      person2 = m.message.extendedTextMessage.contextInfo.mentionedJid[1]
      
      const user1 = await db.getUser(person1)
      const user2 = await db.getUser(person2)
      
      person1Name = user1.name
      person2Name = user2.name
    } else if (args.length >= 2) {
      // Names provided as arguments
      // Find the separator (and, &, +, etc.)
      let separator = -1
      for (let i = 0; i < args.length; i++) {
        if (['and', '&', '+', 'with', 'x'].includes(args[i].toLowerCase())) {
          separator = i
          break
        }
      }
      
      if (separator === -1) {
        // Split in the middle if no separator found
        separator = Math.floor(args.length / 2)
      }
      
      person1Name = args.slice(0, separator).join(' ')
      person2Name = args.slice(separator + 1).join(' ')
    } else {
      return m.reply('Please provide two names separated by "and", "&", or "+" OR mention two people!')
    }
    
    // Calculate compatibility (pseudo-random but consistent for same pairs)
    const nameHash = (person1Name + person2Name).toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const compatibility = nameHash % 101 // 0-100%
    
    // Determine the ship name (combine parts of both names)
    const shipName = person1Name.slice(0, Math.ceil(person1Name.length / 2)) + 
                    person2Name.slice(Math.floor(person2Name.length / 2))
    
    // Get compatibility message based on score
    let message
    if (compatibility >= 90) {
      message = `These disciples' dao paths are intertwined by the threads of fate itself! Heavenly harmony exists between them.`
    } else if (compatibility >= 70) {
      message = `A powerful alliance! Their combined cultivation would strike fear into the hearts of enemies.`
    } else if (compatibility >= 50) {
      message = `A promising partnership. With time and effort, they could overcome many tribulations together.`
    } else if (compatibility >= 30) {
      message = `Their dao paths cross occasionally, but each walks their own way most of the time.`
    } else {
      message = `Their cultivation methods are incompatible! Like fire and water, they would hinder each other's progress.`
    }
    
    // Create compatibility meter
    const meterLength = 10
    const filledHearts = Math.round((compatibility / 100) * meterLength)
    const meter = '❤️'.repeat(filledHearts) + '🖤'.repeat(meterLength - filledHearts)
    
    // Format ship message
    const shipText = `
*༺ MOUNT HUA DUAL CULTIVATION COMPATIBILITY ༻*

*Disciples:* ${person1Name} & ${person2Name}
*Cultivation Pair Name:* ${shipName}
*Compatibility:* ${compatibility}%

${meter}

*Heaven's Verdict:*
${message}

_"Even immortals seek compatible dao companions."_
`
    
    // Send ship result
    m.reply(shipText)
    
    // Add XP for using command
    await db.addUserXP(m.sender, 4)
    
  } catch (error) {
    console.error('Error in ship command:', error)
    m.reply('This young masters divination abilities are being disrupted by chaotic energy. Try again later.')
  }
}

export default {
  pattern: /^(ship|compatibility|match)$/i,
  handler,
  help: 'Calculate compatibility between two disciples',
  usage: '/ship @user1 @user2',
  example: '/ship @John @Jane',
  tags: ['fun'],
  group: false,
  admin: false,
  owner: false
}