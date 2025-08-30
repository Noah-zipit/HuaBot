import { performance } from 'perf_hooks'

const handler = async (m, { sock, db }) => {
  // Measure response time
  const start = performance.now()
  
  // Send initial message
  await m.reply('*Testing this young master\'s reflexes...*')
  
  // Measure end time
  const end = performance.now()
  
  // Calculate response time
  const responseTime = Math.round(end - start)
  
  // Send final message
  await m.reply(`*Speed:* ${responseTime}ms\n\nThis young master's reflexes are as swift as Mount Hua's Plum Blossom Sword Technique!`)
  
  // Add XP for using command
  await db.addUserXP(m.sender, 1)
}

export default {
  pattern: /^(ping|speed|reflexes)$/i,
  handler,
  help: 'Test the bot\'s response time',
  tags: ['basic'],
  group: false,
  admin: false,
  owner: false
}