// Import core modules
import { connectToWhatsApp } from './core/connection.js'
import { handleMessage } from './core/messageHandler.js'
import Database from './core/database.js'
import { loadPlugins, reloadPlugins } from './core/pluginLoader.js'
import { cleanTmp } from './core/utils.js'
import './config.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`)

// Initialize logging
const originalConsoleLog = console.log
const originalConsoleError = console.error

console.log = function(...args) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ')
  
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  
  fs.appendFileSync(logFile, logMessage)
  originalConsoleLog.apply(console, args)
}

console.error = function(...args) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ')
  
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ERROR: ${message}\n`
  
  fs.appendFileSync(logFile, logMessage)
  originalConsoleError.apply(console, args)
}

// Set up globals
global.plugins = {}

// Initialize database
const db = new Database()
global.db = db

// Load plugins
async function init() {
  // Check for restart marker
  if (fs.existsSync('./restart.marker')) {
    console.log('Bot was restarted intentionally')
    fs.unlinkSync('./restart.marker')
  }
  
  console.log('Loading plugins...')
  global.plugins = await loadPlugins()
  console.log(`Loaded ${Object.keys(global.plugins).length} plugins`)
  
  // Connect to WhatsApp
  console.log('Connecting to WhatsApp...')
  const sock = await connectToWhatsApp()
  
  // Set up message handler
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
      for (const message of messages) {
        try {
          await handleMessage(message, sock, db)
        } catch (err) {
          console.error('Error handling message:', err)
        }
      }
    }
  })
  
  // Set up group participant update handler
  sock.ev.on('group-participants.update', async (update) => {
    // Implement group update handling
    console.log('Group participants update:', update)
    
    try {
      // Get group data
      const group = await db.getGroup(update.id)
      
      // Handle welcome/goodbye messages based on config
      if (update.action === 'add' && group.settings.welcome) {
        for (const participant of update.participants) {
          // Get joined user name
          const userName = await sock.getName(participant)
          
          // Replace placeholders in welcome message
          const welcomeMsg = group.welcomeMessage.replace('{user}', userName)
          
          // Send welcome message
          await sock.sendMessage(update.id, { text: welcomeMsg })
        }
      } else if (update.action === 'remove' && group.settings.goodbye) {
        for (const participant of update.participants) {
          // Get left user name
          const userName = await sock.getName(participant)
          
          // Replace placeholders in goodbye message
          const goodbyeMsg = group.goodbyeMessage.replace('{user}', userName)
          
          // Send goodbye message
          await sock.sendMessage(update.id, { text: goodbyeMsg })
        }
      }
    } catch (err) {
      console.error('Error handling group update:', err)
    }
  })
  
  // Set up group settings update handler
  sock.ev.on('groups.update', async (updates) => {
    console.log('Group updates:', updates)
    
    for (const update of updates) {
      try {
        // Update group name in database if changed
        if (update.subject) {
          await db.updateGroup(update.id, { name: update.subject })
        }
      } catch (err) {
        console.error('Error handling group settings update:', err)
      }
    }
  })
  
  // Clean temporary files every hour
  setInterval(cleanTmp, 3600000)
  
  console.log('Mount Hua Sect Bot is now operational!')
  console.log('This young master is ready to train disciples!')
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Start the bot
init().catch(console.error)