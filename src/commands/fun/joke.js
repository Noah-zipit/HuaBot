const handler = async (m, { sock, db }) => {
  try {
    // Array of Mount Hua style jokes
    const jokes = [
      "Why don't cultivators ever get lost? Because they can always sense their *qi*-rection!",
      
      "What do you call a cultivator who can't control his spiritual energy? A *qi*-diot!",
      
      "How do Mount Hua disciples make their tea? They don't. Making tea is beneath this young master's dignity!",
      
      "Why did the Southern Edge Sect disciple bring a ladder to battle? Because he heard cultivation was all about reaching new heights!",
      
      "What's a cultivator's favorite exercise? Spiritual *qi*-kboxing!",
      
      "What do you call a fat immortal? A heavy-weight spiritual being!",
      
      "Why don't cultivators use smartphones? Because they prefer *spiritual* connections!",
      
      "How many Mount Hua disciples does it take to change a lantern? None! Darkness should feel honored to be in this young master's presence!",
      
      "What did the junior disciple say when he failed the cultivation exam? 'I *qi*-n't believe it!'",
      
      "Why was the sword spirit always happy? Because every day was a *blade* day!",
      
      "What's a cultivator's favorite musical instrument? The *qi*-tar!",
      
      "How do cultivators always stay cool in summer? They practice Cold Jade Technique... while everyone else just sweats!",
      
      "Why did the disciple get kicked out of Mount Hua? He kept asking if he could 'work from home' during sect training!"
    ]
    
    // Select a random joke
    const joke = jokes[Math.floor(Math.random() * jokes.length)]
    
    // Format joke message
    const jokeText = `
*༺ MOUNT HUA HUMOR ༻*

${joke}

_"Even the sternest cultivator must occasionally indulge in humor to balance their qi."_
`
    
    // Send joke
    m.reply(jokeText)
    
    // Add XP for using command
    await db.addUserXP(m.sender, 3)
    
  } catch (error) {
    console.error('Error in joke command:', error)
    m.reply('This young masters humor cannot be comprehended by mere mortals.')
  }
}

export default {
  pattern: /^(joke|humor|funny)$/i,
  handler,
  help: 'Get a cultivation-themed joke',
  tags: ['fun'],
  group: false,
  admin: false,
  owner: false
}