const handler = async (m, { sock, args, db }) => {
  try {
    // Get number of users to display (default 10)
    const limit = parseInt(args[0]) || 10
    
    // Get top users
    const topUsers = await db.getTopUsers(limit)
    
    // Check if any users found
    if (!topUsers || topUsers.length === 0) {
      return m.reply('No disciples have begun their cultivation journey yet.')
    }
    
    // Format leaderboard
    let leaderboardText = '*༺ MOUNT HUA CULTIVATION RANKINGS ༻*\n\n'
    
    topUsers.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      leaderboardText += `${medal} *${user.name}*\n`
      leaderboardText += `   ├ Lvl ${user.level}: ${user.title}\n`
      leaderboardText += `   └ ${user.xp} cultivation points\n\n`
    })
    
    leaderboardText += `_"Ranking means nothing if you do not continue to improve. Even the mightiest can fall from grace with complacency."_`
    
    // Send leaderboard
    m.reply(leaderboardText)
    
    // Add XP for checking leaderboard
    await db.addUserXP(m.sender, 2)
    
  } catch (error) {
    console.error('Error in leaderboard command:', error)
    m.reply('This young master encountered a spiritual disturbance while compiling the rankings.')
  }
}

export default {
  pattern: /^(leaderboard|top|ranking|rank)$/i,
  handler,
  help: 'View the top cultivators ranked by cultivation level',
  usage: '/leaderboard [number]',
  example: '/leaderboard 5',
  tags: ['basic'],
  group: false,
  admin: false,
  owner: false
}