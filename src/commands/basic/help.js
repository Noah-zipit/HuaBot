const handler = async (m, { sock, args, db }) => {
  // Check if specific command was requested
  if (args.length > 0) {
    const commandName = args[0].toLowerCase()
    
    // Find command in plugins
    let found = false
    for (const [id, plugin] of Object.entries(global.plugins)) {
      if (id.split('/')[1].replace('.js', '').toLowerCase() === commandName || 
          (plugin.pattern && plugin.pattern.test(commandName))) {
        
        // Format permissions
        const permissions = []
        if (plugin.owner) permissions.push('Sect Master Only')
        if (plugin.admin) permissions.push('Administrators Only')
        if (plugin.group) permissions.push('Groups Only')
        if (plugin.premium) permissions.push('Core Disciples Only')
        
        // Create help text
        const helpText = `
*༺ Command: /${commandName} ༻*

*Description:* ${plugin.help || 'No description available'}
*Category:* ${plugin.category || 'Miscellaneous'}
${permissions.length > 0 ? `*Permissions:* ${permissions.join(', ')}` : ''}
${plugin.usage ? `*Usage:* ${plugin.usage}` : ''}
${plugin.example ? `*Example:* ${plugin.example}` : ''}

_"A cultivator must understand a technique before attempting to master it."_
`
        
        m.reply(helpText)
        found = true
        break
      }
    }
    
    if (!found) {
      m.reply(`This young master knows no technique called *${commandName}*. Check your spelling or use */menu* to see available techniques.`)
    }
  } else {
    // General help message
    const helpText = `
*༺ MOUNT HUA SECT HELP ༻*

To use a command, send a message starting with */*
Example: */profile*

To get help with a specific command, use:
*/help [command name]*
Example: */help profile*

*Command Categories:*
• *Basic* - Essential techniques
• *Admin* - Group management techniques
• *Group* - Sect gathering techniques
• *Fun* - Entertainment techniques
• *Media* - Media handling techniques
• *Owner* - Sect Master techniques

Use */menu* to see all available commands.

_"A journey of a thousand miles begins with understanding the basics."_
`
    
    m.reply(helpText)
  }
  
  // Add XP for using help
  await db.addUserXP(m.sender, 2)
}

export default {
  pattern: /^(help|guide|howto)$/i,
  handler,
  help: 'Get detailed help on commands',
  usage: '/help [command name]',
  example: '/help profile',
  tags: ['basic'],
  group: false,
  admin: false,
  owner: false
}