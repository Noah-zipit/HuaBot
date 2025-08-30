const handler = async (m, { sock, db }) => {
  try {
    // Array of cultivation-themed riddles with answers
    const riddles = [
      {
        question: "I am sharpened by stillness, not motion. Though I can cut mountains, I have no edge. What am I?",
        answer: "Spiritual energy/Qi"
      },
      {
        question: "I grow stronger when broken, yet weaker when fed. Immortals seek me, yet mortals dread me. What am I?",
        answer: "Cultivation bottleneck"
      },
      {
        question: "The more you fill me, the lighter I become. Immortals hold me, mortals seek me. What am I?",
        answer: "Dantian/Spiritual core"
      },
      {
        question: "I flow through all things but cannot be seen. I can be cultivated but never created. What am I?",
        answer: "Dao/The Way"
      },
      {
        question: "I am born in secret, live in silence, and die with revelation. Cultivators treasure me above gold. What am I?",
        answer: "Cultivation technique"
      },
      {
        question: "I am a battle with no opponent, a journey with no destination, a treasure with no form. What am I?",
        answer: "Meditation"
      },
      {
        question: "The young cannot use me, the old cannot master me. I am gained in an instant but built over a lifetime. What am I?",
        answer: "Enlightenment"
      },
      {
        question: "I am sharp enough to cut mountains but have no blade. I'm forged in stillness, not in flame. What am I?",
        answer: "Sword intent"
      },
      {
        question: "The more a cultivator values me, the less powerful they become. The more they ignore me, the more they advance. What am I?",
        answer: "Material possessions/Worldly attachments"
      },
      {
        question: "I am a poison to the weak but nectar to the strong. I break mortals but forge immortals. What am I?",
        answer: "Tribulation/Heavenly trial"
      }
    ]
    
    // Select a random riddle
    const riddle = riddles[Math.floor(Math.random() * riddles.length)]
    
    // Store the riddle in the user's data for checking the answer later
    await db.updateUser(m.sender, { 
      'currentRiddle': {
        question: riddle.question,
        answer: riddle.answer,
        timestamp: Date.now()
      }
    })
    
    // Format riddle message
    const riddleText = `
*༺ MOUNT HUA RIDDLE ༻*

${riddle.question}

To answer, use /answer [your answer]

_"A cultivator's mind must be as sharp as their sword."_
`
    
    // Send riddle
    m.reply(riddleText)
    
    // Add XP for using command
    await db.addUserXP(m.sender, 2)
    
  } catch (error) {
    console.error('Error in riddle command:', error)
    m.reply('This young masters wisdom is being clouded by chaotic energy. The riddle cannot be manifested now.')
  }
}

export default {
  pattern: /^(riddle|puzzle|enigma)$/i,
  handler,
  help: 'Get a cultivation-themed riddle to solve',
  tags: ['fun'],
  group: false,
  admin: false,
  owner: false
}