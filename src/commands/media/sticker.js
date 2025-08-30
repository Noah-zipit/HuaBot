import { Sticker } from 'wa-sticker-formatter'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.join(__dirname, '../../../tmp')

const handler = async (m, { sock, args, db }) => {
  try {
    // Check if media message or quoted message
    let mediaMsg
    
    if (m.type === 'imageMessage' || m.type === 'videoMessage') {
      mediaMsg = m
    } else if (m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.type === 'videoMessage')) {
      mediaMsg = m.quoted
    } else {
      return m.reply('Reply to an image or video to create a sticker, or send an image with caption */sticker*')
    }
    
    // Show processing message
    await m.reply(global.mess.wait)
    
    // Get media type
    const isVideo = mediaMsg.type === 'videoMessage'
    
    // Download media
    const media = await mediaMsg.download()
    if (!media) {
      return m.reply('Failed to download media. Try again with a different image/video.')
    }
    
    // Create sticker
    const stickerOptions = {
      pack: args[0] || 'Mount Hua Sect',
      author: args[1] || 'Chung Myeong',
      type: isVideo ? 'full' : 'default',
      categories: ['🌸', '⚔️'],
      id: Date.now().toString(),
      quality: 70,
    }
    
    const sticker = new Sticker(media.buffer, stickerOptions)
    const stickerBuffer = await sticker.toBuffer()
    
    // Send sticker
    await sock.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m.message })
    
    // Add XP for using command
    await db.addUserXP(m.sender, 5)
    
  } catch (error) {
    console.error('Error creating sticker:', error)
    m.reply('Failed to create sticker. A true martial artist would provide better materials.')
  }
}

export default {
  pattern: /^(s|sticker|stiker|seal)$/i,
  handler,
  help: 'Convert image/video to sticker',
  tags: ['media'],
  group: false,
  admin: false,
  owner: false
}