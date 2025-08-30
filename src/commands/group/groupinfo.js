import { formatTime } from '../../core/utils.js'

const handler = async (m, { sock, db }) => {
  // Check if in a group
  if (!m.isGroup) {
    return m.reply(global.mess.only.group)
  }
  
  try {
    // Get group metadata
    const groupMetadata = await sock.groupMetadata(m.chat)
    
    // Get group data from database
    const group = await db.getGroup(m.chat)
    
    // Count admins and members
    const adminCount = groupMetadata.participants.filter(p => p.admin).length
    const memberCount = groupMetadata.participants.length
    
    // Format creation time
    const creationTime = new Date(groupMetadata.creation * 1000)
    const creationTimeStr = formatTime((Date.now() - creationTime) / 1000) + ' ago'
    
    // Format group description
    const description = groupMetadata.desc ? groupMetadata.desc : 'No description'
    
    // Format group settings
    const settings = []
    for (const [key, value] of Object.entries(group.settings)) {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase()
      settings.push(`${formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)}: ${value ? '✅' : '❌'}`)
    }
    
    // Create info text
    const infoText = `
*༺ SECT GATHERING INFORMATION ༻*

*Name:* ${groupMetadata.subject}
*ID:* ${groupMetadata.id}
*Created:* ${creationTimeStr}
*Members:* ${memberCount}
*Administrators:* ${adminCount}

*Settings:*
${settings.join('\n')}

*Description:*
${description}

_"A sect's strength is measured by the quality of its disciples, not their quantity."_
`
    
    // Send info
    m.reply(infoText)
    
  } catch (error) {
    console.error('Error in groupinfo command:', error)
    m.reply('This young master encountered a spiritual disturbance while gathering information.')
  }
}

export default {
  pattern: /^(groupinfo|ginfo|info)$/i,
  handler,
  help: 'View detailed information about the group',
  tags: ['group'],
  group: true,
  admin: false,
  owner: false
}