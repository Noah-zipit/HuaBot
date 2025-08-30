import { formatTime, formatSize } from '../../core/utils.js'
import os from 'os'

const handler = async (m, { sock, db }) => {
  try {
    // Get uptime
    const uptime = formatTime(process.uptime())
    
    // Get memory usage
    const usedMemory = process.memoryUsage().heapUsed
    const totalMemory = os.totalmem()
    
    // Get system info
    const platform = os.platform()
    const arch = os.arch()
    
    // Get database stats
    const usersCount = await countDocuments(db.models.User)
    const groupsCount = await countDocuments(db.models.Group)
    const bannedUsers = await countDocuments(db.models.User, { banned: true })
    const premiumUsers = await countDocuments(db.models.User, { isPremium: true })
    
    // Get command stats
    const stats = await db.getSetting('stats') || { commands: 0, messages: 0, startTime: Date.now() }
    const totalCommands = stats.commands || 0
    const totalMessages = stats.messages || 0
    
    // Get most active group (this would need to be implemented in a real MongoDB setup)
    const mostActiveGroup = { name: "Unknown", messages: 0 }
    
    // Get most active user (this would need to be implemented in a real MongoDB setup)
    const mostActiveUser = { name: "Unknown", activity: 0 }
    
    // Format stat message
    const statMessage = `
*༺ MOUNT HUA SECT STATISTICS ༻*

*System Information:*
├ Uptime: ${uptime}
├ Memory: ${formatSize(usedMemory)}/${formatSize(totalMemory)}
├ Platform: ${platform} (${arch})
└ Started: ${formatTime((Date.now() - stats.startTime) / 1000)} ago

*Database Statistics:*
├ Total Disciples: ${usersCount}
├ Sect Gatherings: ${groupsCount}
├ Banned Disciples: ${bannedUsers}
└ Core Disciples: ${premiumUsers}

*Activity Metrics:*
├ Total Commands: ${totalCommands}
├ Total Messages: ${totalMessages}
├ Most Active Gathering: ${mostActiveGroup.name} (${mostActiveGroup.messages} messages)
└ Most Active Disciple: ${mostActiveUser.name} (${mostActiveUser.activity} activities)

*Mount Hua Proclamation:*
"This young master's influence grows throughout the cultivation world!"
`
    
    m.reply(statMessage)
    
  } catch (error) {
    console.error('Error in botstat command:', error)
    m.reply('This young master encountered a spiritual disturbance while gathering statistics.')
  }
}

// Helper function to count documents
async function countDocuments(model, filter = {}) {
  try {
    return await model.countDocuments(filter)
  } catch (err) {
    console.error('Error counting documents:', err)
    return 0
  }
}

export default {
  pattern: /^(botstat|stats|performance|metrics)$/i,
  handler,
  help: 'View detailed bot statistics',
  tags: ['owner'],
  group: false,
  admin: false,
  owner: true
}