import chalk from 'chalk'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Bot information
global.botname = process.env.BOT_NAME || 'HuaBot'
global.ownername = process.env.OWNER_NAME || 'Noah'
global.packname = 'Mount Hua Sect'
global.author = 'Chung Myeong'

// Owner information
const ownerRaw = process.env.OWNER || '923164413714|Noah'
global.owner = ownerRaw.split(',').map(info => {
  const [number, name] = info.split('|')
  return [number, name || 'Noah', true]
})

// Cultivation system
global.cultivation = {
  levels: [
    'Mortal', 
    'Qi Condensation',
    'Foundation Establishment',
    'Core Formation',
    'Golden Core',
    'Nascent Soul',
    'Divine Soul',
    'Transcendent',
    'Immortal Ascension'
  ],
  titles: [
    'Outer Disciple',
    'Inner Disciple',
    'Core Disciple',
    'Elite Disciple',
    'Peak Disciple',
    'Junior Elder',
    'Elder',
    'Sect Protector',
    'Sect Master'
  ],
  // XP required for each level
  xpRequirements: [0, 100, 300, 600, 1000, 1500, 2500, 4000, 7000, 10000]
}

// Personality responses
global.responses = {
  greeting: [
    "Hmph! Another disciple seeking this young master's guidance?",
    "You dare approach this young master of Mount Hua Sect?",
    "This young master acknowledges your presence, junior.",
    "Mount Hua Sect's Chung Myeong graces you with his attention."
  ],
  success: [
    "As expected of this young master's technique!",
    "Mount Hua's techniques never fail!",
    "Naturally, this young master succeeds in all endeavors."
  ],
  failure: [
    "Tch! Your request was too beneath this young master's dignity.",
    "Your cultivation is insufficient for this technique!",
    "This failure is due to your inadequate spiritual energy!"
  ],
  waiting: [
    "Wait with respect while this young master considers your request.",
    "A true cultivator knows patience. Wait silently.",
    "This young master is analyzing the heavenly patterns..."
  ]
}

// Message templates
global.mess = {
  wait: '*⌛ This young master is considering...*',
  success: '✅ Technique executed successfully!',
  error: {
    stick: '❌ Failed to convert to a talisman',
    Iv: '❌ Invalid spiritual link',
    api: '❌ Spiritual disturbance detected'
  },
  only: {
    group: '⚠️ This technique can only be used in sect gatherings!',
    owner: '⚠️ Only the Sect Master may use this technique!',
    premium: '⚠️ This technique is reserved for core disciples!',
    admin: '⚠️ Only sect administrators may use this technique!',
    botAdmin: '⚠️ Make this young master an administrator first!'
  }
}

// Log configuration
console.log(chalk.greenBright('Loading Mount Hua configuration...'))
console.log(chalk.yellowBright(`Bot Name: ${global.botname}`))
console.log(chalk.blueBright(`Owner: ${global.owner.map(o => o[1]).join(', ')}`))