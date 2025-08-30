import util from 'util'

const handler = async (m, { sock, args, db }) => {
  // Get code to evaluate
  let code = args.join(' ')
  
  if (!code) {
    return m.reply('What divine script should this young master execute?')
  }
  
  try {
    // Add common variables to context
    let evaled
    
    // Different eval approaches based on return keyword presence
    if (code.includes('return')) {
      evaled = await eval(`(async () => { ${code} })()`)
    } else {
      evaled = await eval(`(async () => { ${code} })()`)
    }
    
    if (typeof evaled !== 'string') {
      evaled = util.inspect(evaled, { depth: 0 })
    }
    
    // Send result with formatting
    await m.reply(`*Divine Script Result:*\n\`\`\`js\n${evaled}\n\`\`\``)
    
  } catch (err) {
    m.reply(`*Spiritual Disturbance Detected!*\n\`\`\`js\n${err}\n\`\`\``)
  }
}

export default {
  pattern: /^(eval|execute|script|run)$/i,
  handler,
  help: 'Execute JavaScript code (Owner only)',
  usage: '/eval [code]',
  example: '/eval return 1 + 1',
  tags: ['owner'],
  group: false,
  admin: false,
  owner: true
}