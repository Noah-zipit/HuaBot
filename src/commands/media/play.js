// src/commands/media/play.js
import { formatSize, isValidURL } from '../../core/utils.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { exec } from 'child_process'

const execPromise = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.join(__dirname, '../../../tmp')

// Make sure tmp directory exists
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true })
}

// Function to extract YouTube ID from URL
function extractYouTubeID(url) {
  const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

const handler = async (m, { sock, args, db }) => {
  if (!args[0]) {
    return m.reply('Foolish disciple! Provide the name of the spiritual melody or visual technique you seek!')
  }
  
  const query = args.join(' ')
  
  try {
    // React to message
    m.react('🔍')
    
    // Inform user of progress
    const waitMsg = await m.reply('*🍁 This young master is searching the heavenly archives...*')
    
    // Determine if it's a URL or a search term
    const isUrl = isValidURL(args[0])
    let videoId = isUrl ? extractYouTubeID(args[0]) : null
    
    // If not a URL, search for it
    if (!videoId) {
      try {
        // Make a search request to YouTube
        const searchUrl = `https://apis-keith.vercel.app/youtube/search?q=${encodeURIComponent(query)}`
        const searchResponse = await axios.get(searchUrl)
        
        if (!searchResponse.data?.status || !searchResponse.data?.result?.length) {
          return m.reply('❌ This young master could not find any results for your query. Perhaps you misspoke?')
        }
        
        // Get the first result
        const firstResult = searchResponse.data.result[0]
        videoId = firstResult.videoId
        
      } catch (error) {
        console.error('Search error:', error)
        return m.reply('❌ This young master encountered a spiritual disturbance while searching. Try again later.')
      }
    }
    
    if (!videoId) {
      return m.reply('❌ This young master could not extract a valid video ID. Ensure your query or URL is correct.')
    }
    
    // Get video details
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    let videoDetails
    
    try {
      const detailsUrl = `https://apis-keith.vercel.app/youtube/details?url=${encodeURIComponent(videoUrl)}`
      const detailsResponse = await axios.get(detailsUrl)
      
      if (!detailsResponse.data?.status) {
        throw new Error('Failed to get video details')
      }
      
      videoDetails = detailsResponse.data.result
    } catch (error) {
      console.error('Details error:', error)
      return m.reply('❌ This young master could not retrieve details for this video. The heavenly algorithm is obscured.')
    }
    
    // Format video info message
    const infoMessage = `
*༺ HEAVENLY ARCHIVE FOUND ༻*

🎵 *Title:* ${videoDetails.title || "Unknown"}
⏳ *Duration:* ${videoDetails.timestamp || videoDetails.duration || "Unknown"}
👀 *Views:* ${videoDetails.views || "Unknown"}
🌏 *Published:* ${videoDetails.ago || "Unknown"}
👤 *Channel:* ${videoDetails.author?.name || "Unknown"}

*This young master can retrieve this in two forms:*
*1.* 🎵 *Audio Cultivation* - For spiritual meditation
*2.* 📽️ *Visual Technique* - For observational training

_Reply with "1" or "2" to make your choice, disciple._
`
    
    // Send video details with thumbnail
    await sock.sendMessage(m.chat, {
      image: { url: videoDetails.thumbnail || videoDetails.image },
      caption: infoMessage
    }, { quoted: m.message })
    
    // Set up response collector for the user's choice
    const filter = msg => 
      msg.sender === m.sender && 
      (msg.body === '1' || msg.body === '2')
    
    // Wait for user response
    const collector = await new Promise((resolve) => {
      const listener = async (message) => {
        if (message.key.remoteJid === m.chat && 
            message.key.fromMe === false && 
            (message.message?.conversation === '1' || 
             message.message?.conversation === '2' ||
             message.message?.extendedTextMessage?.text === '1' || 
             message.message?.extendedTextMessage?.text === '2')) {
          
          // Get the message content
          const responseText = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text
          
          // Check if it's from the same user
          if (message.key.participant === m.sender || 
              message.participant === m.sender || 
              message.key.participant === undefined) {
            
            // Remove the listener to prevent duplicate responses
            sock.ev.off('messages.upsert', listener)
            resolve({
              choice: responseText,
              message: message
            })
          }
        }
      }
      
      // Add the listener
      sock.ev.on('messages.upsert', async ({messages}) => {
        for (const message of messages) {
          await listener(message)
        }
      })
      
      // Set a timeout to remove the listener
      setTimeout(() => {
        sock.ev.off('messages.upsert', listener)
        resolve(null)
      }, 60000) // 1 minute timeout
    })
    
    // If no response, return
    if (!collector) {
      return m.reply('⏱️ Time has elapsed. This young master will not wait forever for indecisive disciples.')
    }
    
    // Get the user's choice
    const choice = collector.choice
    const responseMsg = collector.message
    
    // React to user's choice
    await sock.sendMessage(m.chat, {
      react: {
        text: choice === '1' ? '🎵' : '📽️',
        key: responseMsg.key
      }
    })
    
    // Send processing message
    const processingMsg = await m.reply(global.mess.wait)
    
    // Process based on user's choice
    if (choice === '1') {
      // Audio download
      try {
        // Try primary API
        const api1 = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`
        const api2 = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
        
        let downloadUrl
        let fileSize
        
        try {
          const res1 = await axios.get(api1)
          if (res1.data?.status && res1.data?.result?.downloadUrl) {
            downloadUrl = res1.data.result.downloadUrl
            fileSize = res1.data.result.size || 'Unknown'
          } else {
            throw new Error("Primary API failed")
          }
        } catch (error) {
          console.log("Trying backup API for audio...")
          const res2 = await axios.get(api2)
          if (res2.data?.success && res2.data?.result?.download_url) {
            downloadUrl = res2.data.result.download_url
            fileSize = res2.data.result.size || 'Unknown'
          } else {
            throw new Error("Both APIs failed")
          }
        }
        
        // Send success message
        await sock.sendMessage(m.chat, {
          text: '✅ *Spiritual melody retrieved! This young master will send it shortly...*',
          edit: processingMsg.key
        })
        
        // Send audio
        await sock.sendMessage(m.chat, {
          audio: { url: downloadUrl },
          mimetype: 'audio/mp4',
          fileName: `${videoDetails.title}.mp3`
        }, { quoted: m.message })
        
        // Add XP for using command
        await db.addUserXP(m.sender, 5)
        
      } catch (error) {
        console.error('Audio download error:', error)
        m.reply('❌ This young master encountered a spiritual barrier while retrieving the audio. The celestial network appears disrupted.')
      }
      
    } else if (choice === '2') {
      // Video download
      try {
        // Try primary API
        const api1 = `https://apis-keith.vercel.app/download/dlmp4?url=${encodeURIComponent(videoUrl)}`
        const api2 = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`
        
        let downloadUrl
        let fileSize
        
        try {
          const res1 = await axios.get(api1)
          if (res1.data?.status && res1.data?.result?.downloadUrl) {
            downloadUrl = res1.data.result.downloadUrl
            fileSize = res1.data.result.size || 'Unknown'
          } else {
            throw new Error("Primary API failed")
          }
        } catch (error) {
          console.log("Trying backup API for video...")
          const res2 = await axios.get(api2)
          if (res2.data?.success && res2.data?.result?.download_url) {
            downloadUrl = res2.data.result.download_url
            fileSize = res2.data.result.size || 'Unknown'
          } else {
            throw new Error("Both APIs failed")
          }
        }
        
        // Send success message
        await sock.sendMessage(m.chat, {
          text: '✅ *Visual technique retrieved! This young master will send it shortly...*',
          edit: processingMsg.key
        })
        
        // Send video
        await sock.sendMessage(m.chat, {
          video: { url: downloadUrl },
          caption: `*${videoDetails.title}*\n\n_"Even visual techniques can enhance one's cultivation."_`,
          mimetype: 'video/mp4'
        }, { quoted: m.message })
        
        // Add XP for using command
        await db.addUserXP(m.sender, 7)
        
      } catch (error) {
        console.error('Video download error:', error)
        m.reply('❌ This young master encountered a spiritual barrier while retrieving the video. The celestial network appears disrupted.')
      }
    }
    
  } catch (error) {
    console.error('Error in play command:', error)
    m.reply('This young master encountered a spiritual disturbance while executing this technique. Try again later.')
  }
}

export default {
  pattern: /^(play|song|music|video|ytdl|yt|mp3|mp4)$/i,
  handler,
  help: 'Download audio or video from YouTube',
  usage: '/play [song/video name or YouTube URL]',
  example: '/play mount hua cultivation music',
  tags: ['media'],
  group: false,
  admin: false,
  owner: false
}