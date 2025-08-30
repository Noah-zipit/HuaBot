const handler = async (m, { sock, args, db }) => {
  try {
    // Toggle maintenance mode
    const maintenanceMode = await db.getSetting('maintenanceMode') || { enabled: false, reason: 'Maintenance', time: 0 }
    
    if (args.length > 0) {
      // Set new reason if provided
      maintenanceMode.reason = args.join(' ')
    }
    
    // Toggle enabled state
    maintenanceMode.enabled = !maintenanceMode.enabled
    maintenanceMode.time = Date.now()
    
    // Save to database
    await db.setSetting('maintenanceMode', maintenanceMode)
    
    if (maintenanceMode.enabled) {
      m.reply(`*Maintenance Mode Activated*\n\nThis young master will now enter closed-door cultivation.\n\nReason: ${maintenanceMode.reason}\n\n_Only the Sect Master's commands will be processed until maintenance is complete._`)
    } else {
      m.reply('*Maintenance Mode Deactivated*\n\nThis young master has emerged from closed-door cultivation. All techniques are now available to disciples.')
    }
  } catch (error) {
    console.error('Error in maintenance command:', error)
    m.reply('This young master encountered a spiritual disturbance while toggling maintenance mode.')
  }
}

export default {
  pattern: /^(maintenance|maintain|closeddoor)$/i,
  handler,
  help: 'Toggle bot maintenance mode',
  usage: '/maintenance [reason]',
  example: '/maintenance Updating cultivation techniques',
  tags: ['owner'],
  group: false,
  admin: false,
  owner: true
}