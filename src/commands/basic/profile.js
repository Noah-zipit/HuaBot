import { formatTime } from '../../core/utils.js'

const handler = async (m, { sock, args, db }) => {
  // Get target user (mentioned or self)
  let targetJid = m.sender
  if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }
  
  try {
    // Get user data
    const user = await db.getUser(targetJid)
    const { name, cultivation, stats, inventory = [] } = user
    
    // Calculate next level
    const currentLevel = cultivation.level
    const nextLevel = currentLevel + 1
    
    // Calculate progress
    let progress = '▰▰▰▰▰▰▰▰▰▰' // Default to full if max level
    let progressPercent = '100%'
    
    if (nextLevel < global.cultivation.xpRequirements.length) {
      const currentXP = cultivation.xp
      const nextLevelXP = global.cultivation.xpRequirements[nextLevel]
      const prevLevelXP = global.cultivation.xpRequirements[currentLevel]
      const requiredXP = nextLevelXP - prevLevelXP
      const earnedXP = currentXP - prevLevelXP
      
      const percent = Math.min(Math.floor((earnedXP / requiredXP) * 100), 100)
      progressPercent = `${percent}%`
      
      // Generate progress bar
      const progressBars = Math.floor(percent / 10)
      progress = '▰'.repeat(progressBars) + '▱'.repeat(10 - progressBars)
    }
    
    // Determine cultivation insights based on level
    const insights = [
      "Your foundation is weak. Train diligently, or remain mediocre forever.",
      "You show a hint of potential. Perhaps not entirely hopeless.",
      "Your cultivation base is strengthening. Continue with diligence.",
      "Your spiritual essence flows smoother now. Not bad for a junior.",
      "This young master sees progress in your training. Acceptable.",
      "Your cultivation has reached a notable stage. Continue to seek breakthroughs.",
      "Few disciples reach this level. Your perseverance impresses even this young master.",
      "Your spiritual foundation approaches the realm of true masters. Impressive.",
      "Even among the elders, your cultivation stands out. This young master acknowledges your dedication."
    ][Math.min(currentLevel - 1, 8)]
    
    // Format time stats
    const memberSince = formatTime((Date.now() - stats.joinDate) / 1000)
    const lastActive = formatTime((Date.now() - stats.lastSeen) / 1000)
    
    // Format premium status if applicable
    const premiumStatus = user.isPremium 
      ? `*Premium Disciple:* Yes (Expires in ${formatTime((user.premiumExpires - Date.now()) / 1000)})`
      : `*Premium Disciple:* No`
    
    // Format inventory if available
    const inventoryText = inventory.length > 0
      ? `*Spiritual Treasures:*\n${inventory.map(item => `├ ${item.name} (${item.quantity})`).join('\n')}`
      : `*Spiritual Treasures:* None`
    
    // Personalized evaluation based on activity
    const activityRating = stats.commands + stats.messages
    let evaluation = ""
    
    if (activityRating < 50) {
      evaluation = "Your dedication to cultivation is pathetically lacking. How do you expect to improve?"
    } else if (activityRating < 200) {
      evaluation = "Your effort is mediocre at best. Mount Hua demands more from its disciples."
    } else if (activityRating < 500) {
      evaluation = "Your consistency is satisfactory. This young master sees your commitment."
    } else {
      evaluation = "Your dedication is commendable. Few disciples show such perseverance."
    }
    
    // Create profile text
    const profileText = `
*༺ MOUNT HUA DISCIPLE PROFILE ༻*

*Name:* ${name}
*Rank:* ${cultivation.title}
*Cultivation:* ${cultivation.stage} (Level ${cultivation.level})
*Experience:* ${cultivation.xp} points

*Progress to Next Level:*
${progress} ${progressPercent}

*Stats:*
├ Commands Used: ${stats.commands}
├ Messages Sent: ${stats.messages}
├ Member Since: ${memberSince} ago
└ Last Active: ${lastActive} ago

${premiumStatus}

${inventoryText}

*Master's Evaluation:*
"${insights}"

*Activity Assessment:*
"${evaluation}"
`
    
    // React to message
    m.react('🌸')
    
    // Add XP for checking profile
    if (targetJid === m.sender) {
      await db.addUserXP(m.sender, 2)
    }
    
    // Update last seen time
    await db.updateUser(m.sender, { 'stats.lastSeen': Date.now() })
    
    // Send profile
    m.reply(profileText)
    
  } catch (error) {
    console.error('Error in profile command:', error)
    m.reply('This young master encountered a spiritual disturbance while examining your cultivation.')
  }
}

export default {
  pattern: /^(profile|stats|cultivation|me)$/i,
  handler,
  help: 'View your cultivation profile or another disciple\'s profile',
  tags: ['basic'],
  group: false,
  admin: false,
  owner: false
}