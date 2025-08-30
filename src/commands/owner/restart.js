import fs from 'fs'

const handler = async (m, { sock, db }) => {
  try {
    // Notify about restart
    await m.reply('*Entering Meditation State*\n\nThis young master will briefly enter a cultivation trance to restore spiritual energy.\n\n_Restarting in 5 seconds..._')
    
    // Create marker file to indicate intentional restart
    fs.writeFileSync('./restart.marker', 'restart')
    
    // Schedule restart
    setTimeout(() => {
      console.log('Restarting bot...')
      process.exit()
    }, 5000)
    
  } catch (error) {
    console.error('Error in restart command:', error)
    m.reply('This young master encountered a spiritual disturbance while attempting to meditate.')
  }
}

export default {
  pattern: /^(restart|reboot|refresh)$/i,
  handler,
  help: 'Restart the bot',
  tags: ['owner'],
  group: false,
  admin: false,
  owner: true
}