const handler = async (m, { sock, args, db }) => {
  // Check if message provided
  const text = args.join(' ')
  if (!text) {
    return m.reply('What message does the Sect Master wish to announce to all disciples?')
  }
  
  try {
    // Get all groups
    const groups = await sock.groupFetchAllParticipating()
    const groupIds = Object.keys(groups)
    
    // Send initial status
    m.reply(`*Preparing to transmit to ${groupIds.length} sect gatherings...*`)
    
    // Counter for successful transmissions
    let successCount = 0
    
    // Format broadcast message
    const broadcastMessage = `
╭─────「 *MOUNT HUA ANNOUNCEMENT* 」─────╮

${text}

╰───「 *FROM THE SECT MASTER* 」───╯
`
    
    // Broadcast to groups
    for (const jid of groupIds) {
      try {
        await sock.sendMessage(jid, { text: broadcastMessage })
        successCount++
        
        // Add small delay to prevent spam detection
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        console.error(`Failed to send broadcast to ${jid}:`, err)
      }
    }
    
    // Send completion message
    m.reply(`*Broadcast Complete*\n\nThe Sect Master's message has been transmitted to *${successCount}* out of *${groupIds.length}* gatherings.\n\n_"When the Sect Master speaks, all disciples listen."_`)
    
  } catch (error) {
    console.error('Error in broadcast command:', error)
    m.reply('This young master encountered a spiritual disturbance while transmitting your message.')
  }
}

export default {
  pattern: /^(broadcast|bc|announce)$/i,
  handler,
  help: 'Broadcast a message to all groups',
  tags: ['owner'],
  group: false,
  admin: false,
  owner: true
}