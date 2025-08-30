import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Format time in seconds to human-readable string
 */
export function formatTime(seconds) {
  seconds = Math.floor(seconds)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  const parts = []
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
  if (secs > 0) parts.push(`${secs} second${secs > 1 ? 's' : ''}`)
  
  return parts.join(', ')
}

/**
 * Format bytes to human-readable string
 */
export function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Download file from URL
 */
export async function downloadFile(url) {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
      }
    })
    const buffer = Buffer.from(response.data, 'binary')
    
    // Try to determine file type
    let fileType = { ext: 'bin', mime: 'application/octet-stream' }
    try {
      const { fileTypeFromBuffer } = await import('file-type')
      fileType = await fileTypeFromBuffer(buffer) || fileType
    } catch (e) {
      console.error('Error determining file type:', e)
    }
    
    const fileName = `${Date.now()}.${fileType.ext}`
    const filePath = path.join(__dirname, '../../tmp', fileName)
    
    fs.writeFileSync(filePath, buffer)
    
    return {
      buffer,
      fileName,
      filePath,
      mime: fileType.mime
    }
  } catch (e) {
    console.error('Error downloading file:', e)
    return null
  }
}

/**
 * Clean up temporary files
 */
export function cleanTmp() {
  const tmpDir = path.join(__dirname, '../../tmp')
  
  if (fs.existsSync(tmpDir)) {
    const files = fs.readdirSync(tmpDir)
    const now = Date.now()
    
    for (const file of files) {
      const filePath = path.join(tmpDir, file)
      const stats = fs.statSync(filePath)
      const age = now - stats.mtimeMs
      
      // Delete files older than 1 hour
      if (age > 3600000) {
        fs.unlinkSync(filePath)
        console.log(`Deleted temporary file: ${file}`)
      }
    }
  }
}

/**
 * Generate random cultivation wisdom
 */
export function getCultivationWisdom() {
  const wisdom = [
    "The path to immortality is not found by seeking immortality, but by achieving perfection in each step of the journey.",
    "A sword is only as sharp as its wielder's resolve.",
    "True strength is not measured by what you can destroy, but by what you can protect.",
    "The most valuable technique is often the one you've practiced ten thousand times, not the one you've learned yesterday.",
    "A moment of patience in a moment of anger saves a thousand moments of regret.",
    "The greatest obstacle in cultivation is not external challenges, but the demons within one's heart.",
    "Even the mightiest peak was once a small rock that refused to yield to the elements.",
    "Progress in cultivation is like climbing a mountain: focus on the next step, not the summit.",
    "A true master fears not the ten thousand techniques practiced once, but the one technique practiced ten thousand times.",
    "The purest sword intent comes not from hatred of enemies, but from love of what you protect."
  ]
  
  return wisdom[Math.floor(Math.random() * wisdom.length)]
}

/**
 * Create ASCII art text box
 */
export function createTextBox(text, title = '') {
  const lines = text.split('\n')
  const maxLength = Math.max(...lines.map(line => line.length), title.length)
  
  let result = '╭' + '─'.repeat(maxLength + 2) + '╮\n'
  
  if (title) {
    result += '│ ' + title + ' '.repeat(maxLength - title.length) + ' │\n'
    result += '├' + '─'.repeat(maxLength + 2) + '┤\n'
  }
  
  for (const line of lines) {
    result += '│ ' + line + ' '.repeat(maxLength - line.length) + ' │\n'
  }
  
  result += '╰' + '─'.repeat(maxLength + 2) + '╯'
  
  return result
}

/**
 * Get random response from array
 */
export function getRandomResponse(type) {
  if (!global.responses || !global.responses[type] || !global.responses[type].length) {
    return "This young master acknowledges your presence."
  }
  
  const responses = global.responses[type]
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Execute shell command
 */
export async function execShell(command) {
  try {
    const { stdout, stderr } = await execPromise(command)
    return { stdout, stderr }
  } catch (e) {
    return { error: e.message }
  }
}

/**
 * Check if URL is valid
 */
export function isValidURL(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Generate a random ID
 */
export function generateId(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

/**
 * Sleep function
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Parse time string to milliseconds (1h, 30m, 10s)
 */
export function parseTimeString(timeStr) {
  if (!timeStr) return 0
  
  const regex = /(\d+)([hms])/g
  let totalMs = 0
  let match
  
  while ((match = regex.exec(timeStr)) !== null) {
    const value = parseInt(match[1])
    const unit = match[2]
    
    switch (unit) {
      case 'h':
        totalMs += value * 60 * 60 * 1000
        break
      case 'm':
        totalMs += value * 60 * 1000
        break
      case 's':
        totalMs += value * 1000
        break
    }
  }
  
  return totalMs || 0
}