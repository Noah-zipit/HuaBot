import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Load all plugins from the commands directory
 */
async function loadPlugins() {
  const plugins = {}
  const commandsDir = path.join(__dirname, '../commands')
  
  // Check if commands directory exists
  if (!fs.existsSync(commandsDir)) {
    console.error('Commands directory not found')
    return plugins
  }
  
  // Get all subdirectories
  const categories = fs.readdirSync(commandsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  // Load plugins from each category
  for (const category of categories) {
    const categoryDir = path.join(commandsDir, category)
    const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.js'))
    
    for (const file of files) {
      try {
        const filePath = path.join(categoryDir, file)
        const fileUrl = pathToFileURL(filePath).href
        
        // Clear cache for hot reloading
        delete require.cache[require.resolve(fileUrl)]
        
        // Add timestamp to URL to prevent caching
        const module = await import(`${fileUrl}?update=${Date.now()}`)
        
        const plugin = module.default || module
        const pluginId = `${category}/${file}`
        
        plugins[pluginId] = {
          ...plugin,
          category,
          filename: file
        }
        
        console.log(`Loaded plugin: ${pluginId}`)
      } catch (e) {
        console.error(`Error loading plugin ${file}:`, e)
      }
    }
  }
  
  return plugins
}

/**
 * Reload all plugins
 */
async function reloadPlugins() {
  global.plugins = {}
  return await loadPlugins()
}

export { loadPlugins, reloadPlugins }