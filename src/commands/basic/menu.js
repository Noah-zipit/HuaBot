// src/commands/basic/menu.js
import { formatTime } from '../../core/utils.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logoPath = path.join(__dirname, '../../../asset/logo.jpg')

// Category styling with bold font and emojis
const CATEGORY_COLORS = {
  basic: "*🌸 𝗕𝗮𝘀𝗶𝗰 𝗧𝗲𝗰𝗵𝗻𝗶𝗾𝘂𝗲𝘀*",
  admin: "*⚔️ 𝗔𝗱𝗺𝗶𝗻 𝗧𝗲𝗰𝗵𝗻𝗶𝗾𝘂𝗲𝘀*",
  group: "*👥 𝗚𝗿𝗼𝘂𝗽 𝗧𝗲𝗰𝗵𝗻𝗶𝗾𝘂𝗲𝘀*",
  fun: "*🎭 𝗙𝘂𝗻 𝗧𝗲𝗰𝗵𝗻𝗶𝗾𝘂𝗲𝘀*",
  media: "*📽️ 𝗠𝗲𝗱𝗶𝗮 𝗧𝗲𝗰𝗵𝗻𝗶𝗾𝘂𝗲𝘀*",
  owner: "*👑 𝗢𝘄𝗻𝗲𝗿 𝗧𝗲𝗰𝗵𝗻𝗶𝗾𝘂𝗲𝘀*"
};

// Fancy dividers for categories
const CATEGORY_DIVIDER = "*━━━❰ %s ❱━━━*";

// Wisdom quotes for random selection
const WISDOM_QUOTES = [
  "Even the mightiest mountain was once a small hill. Your cultivation journey has only begun.",
  "A sword's sharpness comes not from its edge, but from the will of its wielder.",
  "The path to immortality is paved with diligent practice and humble learning.",
  "A true cultivator sees opportunity in every challenge and growth in every setback.",
  "Mount Hua's techniques are like the changing seasons - powerful, inevitable, and awe-inspiring.",
  "The difference between a novice and a master is that the master has failed more times than the novice has tried.",
  "True power comes not from techniques, but from understanding when to use them.",
  "Like the plum blossom that blooms in winter, a true cultivator thrives in adversity.",
  "The greatest battle is not against others, but against the limitations you place upon yourself."
];

const handler = async (m, { sock, db }) => {
  try {
    // Get uptime
    const uptime = formatTime(process.uptime())
    
    // Get user data
    const user = await db.getUser(m.sender)
    
    // Build command list
    const commandsByCategory = {}
    Object.entries(global.plugins).forEach(([id, plugin]) => {
      // Skip hidden commands
      if (plugin.hide) return;
      
      const category = plugin.category || 'misc'
      if (!commandsByCategory[category]) commandsByCategory[category] = []
      
      const cmd = id.split('/')[1].replace('.js', '')
      
      // Add permission indicators
      let cmdText = cmd;
      if (plugin.owner) cmdText += " 👑";
      if (plugin.premium) cmdText += " 🔰";
      
      if (!commandsByCategory[category].includes(cmdText)) {
        commandsByCategory[category].push(cmdText)
      }
    })
    
    // Format menu text
    let text = `*🍁 Greetings! I am Chung Myeong of Mount Hua Sect! 🍁*\n`
    text += `*The cultivation techniques are listed below.*\n`
    
    // Add commands by category
    Object.entries(commandsByCategory).sort().forEach(([category, cmds]) => {
      if (cmds.length > 0 && CATEGORY_COLORS[category]) {
        // Add category header with divider
        text += `\n${CATEGORY_DIVIDER.replace('%s', category.toUpperCase())}\n`
        
        // Add commands as comma-separated list
        text += cmds.join(' , ')
        text += '\n'
      }
    })
    
    // Select random wisdom quote
    const randomWisdom = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
    
    // Add footer with user info and stats
    text += `\n ────────────────────\n`
    text += `│- ᴅɪꜱᴄɪᴘʟᴇ: *${user.name}*\n`
    text += `│- ᴄᴜʟᴛɪᴠᴀᴛɪᴏɴ: ${user.cultivation.level.toFixed(1)} (${user.cultivation.stage})\n`
    text += `│- ᴛɪᴛʟᴇ: ${user.cultivation.title}\n`
    text += `│- ꜱᴇᴄᴛ: Mount Hua\n`
    text += `│- ᴜᴘᴛɪᴍᴇ: ${uptime}\n`
    text += `╰────────────────────\n\n`
    text += `_"${randomWisdom}"_`
    
    // Check if logo file exists
    if (fs.existsSync(logoPath)) {
      // Send menu with image
      await sock.sendMessage(m.chat, {
        image: fs.readFileSync(logoPath),
        caption: text
      }, { quoted: m.message })
    } else {
      // Log error for missing file
      console.error('Menu logo not found at:', logoPath)
      
      // Send text-only menu if image doesn't exist
      await m.reply(text + '\n\n(Image not found: Please create the directory /asset and add logo.jpg)')
    }
    
    // Add XP for using menu
    await db.addUserXP(m.sender, 2)
    
  } catch (error) {
    console.error('Error in menu command:', error)
    
    // Fallback to text-only menu
    m.reply('This young master encountered a spiritual disturbance while preparing the visual scroll. Here is the text version of the techniques instead.')
    
    // Retry sending just the text
    try {
      let textOnly = `*🍁 Greetings! I am Chung Myeong of Mount Hua Sect! 🍁*\n`
      textOnly += `*The cultivation techniques are listed below.*\n`
      
      // Add commands by category
      Object.entries(commandsByCategory || {}).sort().forEach(([category, cmds]) => {
        if (cmds && cmds.length > 0 && CATEGORY_COLORS[category]) {
          textOnly += `\n${CATEGORY_DIVIDER.replace('%s', category.toUpperCase())}\n`
          textOnly += cmds.join(' , ')
          textOnly += '\n'
        }
      })
      
      m.reply(textOnly)
    } catch (e) {
      m.reply('This young masters technique scroll is currently unavailable. Try again later.')
    }
  }
}

export default {
  pattern: /^(menu|commands|techniques|list)$/i,
  handler,
  help: 'Display all available techniques',
  tags: ['basic'],
  group: false,
  admin: false,
  owner: false
}