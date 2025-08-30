import mongoose from 'mongoose'
import dotenv from 'dotenv'
import chalk from 'chalk'

// Load environment variables
dotenv.config()

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI

// Schemas
const userSchema = new mongoose.Schema({
  jid: { type: String, required: true, index: true },
  name: { type: String, default: 'Disciple' },
  cultivation: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    title: { type: String, default: 'Outer Disciple' },
    stage: { type: String, default: 'Mortal' }
  },
  stats: {
    commands: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
    joinDate: { type: Date, default: Date.now }
  },
  settings: {
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true }
  },
  inventory: [{
    id: String,
    name: String,
    description: String,
    quantity: Number,
    type: String,
    acquiredAt: Date
  }],
  warnings: { type: Number, default: 0 },
  banned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },
  isMuted: { type: Boolean, default: false },
  muteExpires: { type: Date, default: null },
  isPremium: { type: Boolean, default: false },
  premiumExpires: { type: Date, default: null }
});

const groupSchema = new mongoose.Schema({
  jid: { type: String, required: true, index: true },
  name: { type: String, default: 'Mount Hua Group' },
  settings: {
    welcome: { type: Boolean, default: true },
    goodbye: { type: Boolean, default: true },
    antiLink: { type: Boolean, default: false },
    antiSpam: { type: Boolean, default: false },
    nsfw: { type: Boolean, default: false },
    autoSticker: { type: Boolean, default: false }
  },
  welcomeMessage: { type: String, default: 'Welcome to Mount Hua Sect, {user}! May your cultivation journey be successful.' },
  goodbyeMessage: { type: String, default: 'Farewell, {user}. Your cultivation journey continues elsewhere.' },
  rules: { type: String, default: 'No rules set. The Sect Master should establish proper guidelines.' },
  blacklisted: [String],
  muted: { type: Boolean, default: false },
  stats: {
    messages: { type: Number, default: 0 }
  }
});

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

// Models
const models = {
  User: mongoose.model('User', userSchema),
  Group: mongoose.model('Group', groupSchema),
  Setting: mongoose.model('Setting', settingSchema)
};

class Database {
  constructor() {
    this.connected = false;
    this.models = models;
    this.data = {
      users: {},
      groups: {},
      settings: {}
    };
    
    // Connect to MongoDB
    this.connect();
  }
  
  async connect() {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log(chalk.green('Connected to MongoDB database!'));
      this.connected = true;
      
      // Load initial settings
      await this.loadSettings();
      
      // Create stats setting if not exists
      const statsExists = await this.models.Setting.exists({ key: 'stats' });
      if (!statsExists) {
        await this.models.Setting.create({
          key: 'stats',
          value: {
            commands: 0,
            messages: 0,
            startTime: Date.now()
          }
        });
        
        await this.loadSettings();
      }
      
    } catch (err) {
      console.error(chalk.red('Failed to connect to MongoDB:'), err);
    }
  }
  
  async loadSettings() {
    const settings = await this.models.Setting.find();
    this.data.settings = {};
    
    for (const setting of settings) {
      this.data.settings[setting.key] = setting.value;
    }
  }
  
  // Get user from database or create if not exists
  async getUser(jid) {
    try {
      // Try to find user
      let user = await this.models.User.findOne({ jid });
      
      // Create new user if not found
      if (!user) {
        user = await this.initUser(jid);
      }
      
      return user.toObject();
    } catch (err) {
      console.error('Error getting user:', err);
      return this.initUser(jid);
    }
  }
  
  // Initialize new user
  async initUser(jid, name = 'Disciple') {
    try {
      const newUser = new this.models.User({
        jid,
        name,
        cultivation: {
          level: 1,
          xp: 0,
          title: global.cultivation.titles[0],
          stage: global.cultivation.levels[0]
        },
        stats: {
          commands: 0,
          messages: 0,
          lastSeen: Date.now(),
          joinDate: Date.now()
        }
      });
      
      await newUser.save();
      return newUser.toObject();
    } catch (err) {
      console.error('Error initializing user:', err);
      return {
        jid,
        name,
        cultivation: {
          level: 1,
          xp: 0,
          title: global.cultivation.titles[0],
          stage: global.cultivation.levels[0]
        },
        stats: {
          commands: 0,
          messages: 0,
          lastSeen: Date.now(),
          joinDate: Date.now()
        }
      };
    }
  }
  
  // Add XP and handle level ups
  async addUserXP(jid, amount) {
    try {
      const user = await this.models.User.findOne({ jid });
      
      if (!user) {
        await this.initUser(jid);
        return { leveledUp: false };
      }
      
      // Get current level and XP
      const currentLevel = user.cultivation.level;
      user.cultivation.xp += amount;
      
      // Check for level up
      const xpReqs = global.cultivation.xpRequirements;
      
      // Find the highest level user qualifies for
      let newLevel = currentLevel;
      for (let i = currentLevel + 1; i < xpReqs.length; i++) {
        if (user.cultivation.xp >= xpReqs[i]) {
          newLevel = i;
        } else {
          break;
        }
      }
      
      // If leveled up, update user data
      if (newLevel > currentLevel) {
        user.cultivation.level = newLevel;
        user.cultivation.title = global.cultivation.titles[Math.min(newLevel - 1, global.cultivation.titles.length - 1)];
        user.cultivation.stage = global.cultivation.levels[Math.min(newLevel - 1, global.cultivation.levels.length - 1)];
        
        await user.save();
        
        return {
          leveledUp: true,
          oldLevel: currentLevel,
          newLevel: newLevel
        };
      }
      
      await user.save();
      return { leveledUp: false };
    } catch (err) {
      console.error('Error adding user XP:', err);
      return { leveledUp: false, error: err.message };
    }
  }
  
  // Group methods
  async getGroup(jid) {
    try {
      let group = await this.models.Group.findOne({ jid });
      
      if (!group) {
        group = await this.initGroup(jid);
      }
      
      return group.toObject();
    } catch (err) {
      console.error('Error getting group:', err);
      return this.initGroup(jid);
    }
  }
  
  async initGroup(jid, name = 'Mount Hua Group') {
    try {
      const newGroup = new this.models.Group({
        jid,
        name
      });
      
      await newGroup.save();
      return newGroup.toObject();
    } catch (err) {
      console.error('Error initializing group:', err);
      return {
        jid,
        name,
        settings: {
          welcome: true,
          goodbye: true,
          antiLink: false,
          antiSpam: false,
          nsfw: false,
          autoSticker: false
        }
      };
    }
  }
  
  // Update user or group
  async updateUser(jid, updates) {
    try {
      await this.models.User.updateOne({ jid }, { $set: updates });
      return true;
    } catch (err) {
      console.error('Error updating user:', err);
      return false;
    }
  }
  
  async updateGroup(jid, updates) {
    try {
      await this.models.Group.updateOne({ jid }, { $set: updates });
      return true;
    } catch (err) {
      console.error('Error updating group:', err);
      return false;
    }
  }
  
  // Stats tracking
  async trackCommand(command, userId) {
    try {
      // Increment global command counter
      await this.models.Setting.updateOne(
        { key: 'stats' },
        { $inc: { 'value.commands': 1 } }
      );
      
      // Track specific command
      await this.models.Setting.updateOne(
        { key: `cmd_${command}` },
        { $inc: { 'value.count': 1 } },
        { upsert: true }
      );
      
      // Track user command usage
      await this.models.User.updateOne(
        { jid: userId },
        { 
          $inc: { 'stats.commands': 1 },
          $set: { 'stats.lastSeen': Date.now() }
        }
      );
      
      await this.loadSettings();
    } catch (err) {
      console.error('Error tracking command:', err);
    }
  }
  
  async trackMessage(userId, groupId = null) {
    try {
      // Increment global message counter
      await this.models.Setting.updateOne(
        { key: 'stats' },
        { $inc: { 'value.messages': 1 } }
      );
      
      // Track user message
      await this.models.User.updateOne(
        { jid: userId },
        { 
          $inc: { 'stats.messages': 1 },
          $set: { 'stats.lastSeen': Date.now() }
        }
      );
      
      // Track group message if applicable
      if (groupId && groupId.endsWith('@g.us')) {
        await this.models.Group.updateOne(
          { jid: groupId },
          { $inc: { 'stats.messages': 1 } }
        );
      }
      
      await this.loadSettings();
    } catch (err) {
      console.error('Error tracking message:', err);
    }
  }
  
  // Top users
  async getTopUsers(limit = 10) {
    try {
      const users = await this.models.User.find()
        .sort({ 'cultivation.xp': -1 })
        .limit(limit);
      
      return users.map(user => ({
        jid: user.jid,
        name: user.name,
        xp: user.cultivation.xp,
        level: user.cultivation.level,
        title: user.cultivation.title
      }));
    } catch (err) {
      console.error('Error getting top users:', err);
      return [];
    }
  }
  
  // Inventory management
  async addInventoryItem(userId, item) {
    try {
      const user = await this.models.User.findOne({ jid: userId });
      
      if (!user) {
        await this.initUser(userId);
        return [];
      }
      
      // Check if item already exists
      const existingItemIndex = user.inventory.findIndex(i => i.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item
        user.inventory[existingItemIndex].quantity += item.quantity || 1;
      } else {
        // Add new item
        user.inventory.push({
          id: item.id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity || 1,
          type: item.type || 'misc',
          acquiredAt: Date.now()
        });
      }
      
      await user.save();
      return user.inventory;
    } catch (err) {
      console.error('Error adding inventory item:', err);
      return [];
    }
  }
  
  // Settings management
  async getSetting(key) {
    try {
      const setting = await this.models.Setting.findOne({ key });
      return setting ? setting.value : null;
    } catch (err) {
      console.error('Error getting setting:', err);
      return null;
    }
  }
  
  async setSetting(key, value) {
    try {
      await this.models.Setting.updateOne(
        { key },
        { $set: { value } },
        { upsert: true }
      );
      
      this.data.settings[key] = value;
      return true;
    } catch (err) {
      console.error('Error setting setting:', err);
      return false;
    }
  }
  
  // Check if user is banned
  async isUserBanned(jid) {
    try {
      const user = await this.models.User.findOne({ jid });
      return user ? user.banned : false;
    } catch (err) {
      console.error('Error checking if user is banned:', err);
      return false;
    }
  }
  
  // Ban/unban user
  async banUser(jid, reason = '') {
    try {
      await this.models.User.updateOne(
        { jid },
        { $set: { banned: true, banReason: reason } }
      );
      return true;
    } catch (err) {
      console.error('Error banning user:', err);
      return false;
    }
  }
  
  async unbanUser(jid) {
    try {
      await this.models.User.updateOne(
        { jid },
        { $set: { banned: false, banReason: '' } }
      );
      return true;
    } catch (err) {
      console.error('Error unbanning user:', err);
      return false;
    }
  }
  
  // Compatibility with older code
  async write() {
    // This is just a compatibility function
    return true;
  }
}

export default Database;