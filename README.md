# 🌸 HuaBot - Mount Hua Sect WhatsApp Bot 🌸

<div align="center">
  
  ![Mount Hua Banner](https://i.imgur.com/QqJSJjt.jpg)

  <h3>A WhatsApp Bot with the proud personality of Chung Myeong from Mount Hua Sect</h3>

  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
  [![WhatsApp API](https://img.shields.io/badge/WhatsApp-Baileys-green.svg)](https://github.com/whiskeysockets/baileys)

</div>

## ⚔️ The Legend of HuaBot

> *"In the realm of digital cultivation, this young master stands supreme!"*

HuaBot embodies the proud, arrogant, yet undeniably skilled persona of Chung Myeong from Mount Hua Sect. This WhatsApp bot brings the cultivation world to your chat groups with its unique personality and extensive features.

Unlike ordinary bots that merely execute commands, HuaBot responds with the haughty demeanor of a cultivation prodigy, referring to itself as "this young master" and addressing users as "disciples," creating an immersive experience inspired by cultivation novels and martial arts culture.

## 🔥 Cultivation Techniques (Features)

HuaBot offers numerous techniques (commands) across various disciplines:

- **🌸 Basic Techniques** - Essential commands for everyday use
- **⚔️ Admin Techniques** - Powerful tools for group management
- **👥 Group Techniques** - Commands for enhancing group interactions
- **🎭 Fun Techniques** - Entertainment commands with cultivation themes
- **📽️ Media Techniques** - Download videos, create stickers, and more
- **👑 Sect Master Techniques** - Special commands for the bot owner

## ✨ Key Features

- **Cultivation System** - Users gain XP and advance through cultivation stages
- **Mount Hua Personality** - Responds with Chung Myeong's arrogant yet charismatic style
- **Comprehensive Media Downloads** - YouTube, TikTok, Instagram support
- **Group Management** - Admin tools, welcome messages, rules enforcement
- **MongoDB Integration** - Reliable database for user progression and settings
- **Interactive Commands** - Features like fortune telling, roasts, and stories

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/huabot.git
cd huabot

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB connection string and other settings

# Start the bot
npm start
```

## ⚙️ Configuration

Edit the `.env` file with your settings:

```
# Bot Configuration
BOT_NAME=HuaBot
OWNER_NAME=Your Name
OWNER=your_number|Your Name

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/huabot

# Bot Settings
PREFIX=/
```

## 🧠 Commands

<details>
<summary><b>🌸 Basic Techniques</b></summary>

| Command | Description |
|---------|-------------|
| /menu | Display all available techniques |
| /profile | View your cultivation profile |
| /help | Get detailed help on commands |
| /ping | Test the bot's response time |
| /leaderboard | View top cultivators |

</details>

<details>
<summary><b>⚔️ Admin Techniques</b></summary>

| Command | Description |
|---------|-------------|
| /kick | Remove a user from the group |
| /ban | Ban a user from the group |
| /mute | Temporarily silence the group |
| /promote | Promote a user to admin |
| /demote | Demote an admin to member |
| /warn | Issue a warning to a user |

</details>

<details>
<summary><b>👥 Group Techniques</b></summary>

| Command | Description |
|---------|-------------|
| /tagall | Mention all group members |
| /hidetag | Mention all members silently |
| /welcome | Configure welcome messages |
| /goodbye | Configure farewell messages |
| /rules | Set or view group rules |
| /groupinfo | View group details |

</details>

<details>
<summary><b>🎭 Fun Techniques</b></summary>

| Command | Description |
|---------|-------------|
| /joke | Get a cultivation-themed joke |
| /roast | Roast a fellow disciple |
| /fortune | Get your cultivation fortune |
| /challenge | Issue a challenge to another user |
| /story | Generate a cultivation story |
| /riddle | Solve a cultivation riddle |
| /ship | Check compatibility between disciples |

</details>

<details>
<summary><b>📽️ Media Techniques</b></summary>

| Command | Description |
|---------|-------------|
| /play | Download YouTube videos/audio |
| /sticker | Create custom stickers |
| /youtube | Search YouTube |
| /tiktok | Download TikTok videos |
| /instagram | Download Instagram posts |

</details>

<details>
<summary><b>👑 Sect Master Techniques</b></summary>

| Command | Description |
|---------|-------------|
| /broadcast | Send message to all groups |
| /maintenance | Toggle maintenance mode |
| /premium | Add premium status to users |
| /ban | Ban user from using the bot |
| /botstat | View bot statistics |
| /restart | Restart the bot |

</details>

## 📸 Screenshots

<div align="center">
  <img src="https://i.imgur.com/example1.jpg" alt="Menu" width="280px" />
  <img src="https://i.imgur.com/example2.jpg" alt="Profile" width="280px" />
  <img src="https://i.imgur.com/example3.jpg" alt="Media Download" width="280px" />
</div>

## 🧩 Cultivation System

HuaBot features a unique cultivation system where users gain XP through interactions:

```
Levels:
1. Mortal
2. Qi Condensation
3. Foundation Establishment
4. Core Formation
5. Golden Core
6. Nascent Soul
7. Divine Soul
8. Transcendent
9. Immortal Ascension

Ranks:
1. Outer Disciple
2. Inner Disciple
3. Core Disciple
4. Elite Disciple
5. Peak Disciple
6. Junior Elder
7. Elder
8. Sect Protector
9. Sect Master
```

## 🛠️ Tech Stack

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Baileys](https://github.com/whiskeysockets/baileys) - WhatsApp Web API
- [MongoDB](https://www.mongodb.com/) - Database for user data
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [Canvas](https://www.npmjs.com/package/canvas) - Image generation
- [Axios](https://axios-http.com/) - HTTP client for API requests

## 🚀 Deployment

You can deploy HuaBot on various platforms:

- **Local Machine** - Run it on your personal computer
- **VPS/Dedicated Server** - For 24/7 uptime
- **Railway/Heroku** - Cloud platforms with easy deployment

## 📃 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [WhatsApp Baileys](https://github.com/whiskeysockets/baileys) for the WhatsApp Web API
- All the cultivation novels that inspired this project
- Mount Hua Sect and Chung Myeong's character, which brought personality to this bot

---

<div align="center">
  
  <h3>Cultivate with HuaBot - Where Technology Meets Martial Arts</h3>
  
  <img src="https://i.imgur.com/QpY2zLP.jpg" alt="Footer Banner" width="500px" />
  
  <p><i>"Even in the digital realm, this young master stands at the peak!"</i></p>
  
</div>