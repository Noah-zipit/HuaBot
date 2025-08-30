const handler = async (m, { sock, args, db }) => {
  try {
    // Get user data
    const user = await db.getUser(m.sender)
    
    // Story elements
    const protagonists = [
      "a proud young master from Mount Hua Sect",
      "a humble disciple with extraordinary potential",
      "an orphaned child with a mysterious bloodline",
      "a reincarnated immortal who lost their memories",
      "a spirit sword seeking a worthy wielder",
      "a demoted elder seeking redemption",
      "a mortal who accidentally consumed a heavenly pill",
      "a physician with knowledge of forbidden healing arts"
    ]
    
    const antagonists = [
      "a rival sect's arrogant young master",
      "an ancient demon awakening from slumber",
      "a corrupted cultivator consumed by darkness",
      "a jealous senior brother plotting revenge",
      "the tyrannical ruler of a nearby kingdom",
      "a fox spirit seeking to steal cultivation",
      "a thousand-year-old corpse that gained sentience",
      "a heavenly tribulation that gained consciousness"
    ]
    
    const settings = [
      "the sacred peaks of Mount Hua",
      "a secret realm that appears once every hundred years",
      "an ancient burial ground of immortals",
      "a bustling cultivation market in the imperial capital",
      "the forbidden Dark Forest where spiritual beasts roam",
      "a hidden valley where time flows differently",
      "a floating island monastery above the clouds",
      "the ruins of a once-great immortal sect"
    ]
    
    const plots = [
      "discovering an ancient cultivation technique",
      "participating in a grand tournament between sects",
      "uncovering a conspiracy that threatens all cultivators",
      "breaking through to a new cultivation realm",
      "seeking revenge for fallen sect members",
      "searching for a legendary spiritual herb",
      "escaping pursuit after accidentally offending a powerful figure",
      "investigating mysterious disappearances of fellow disciples"
    ]
    
    const twists = [
      "the protagonist discovers they are adopted from an enemy sect",
      "the antagonist is revealed to be the protagonist's long-lost sibling",
      "the legendary technique is actually a forbidden one that corrupts the user",
      "what seemed like an enemy was actually trying to help all along",
      "the spiritual treasure is actually a sealed ancient evil",
      "the sect master has been possessed for the past decade",
      "the real villain is the respected elder everyone trusted",
      "the competition was merely a test set by the heavens"
    ]
    
    // Select random elements
    const protagonist = protagonists[Math.floor(Math.random() * protagonists.length)]
    const antagonist = antagonists[Math.floor(Math.random() * antagonists.length)]
    const setting = settings[Math.floor(Math.random() * settings.length)]
    const plot = plots[Math.floor(Math.random() * plots.length)]
    const twist = twists[Math.floor(Math.random() * twists.length)]
    
    // Construct story
    const story = `In the world of immortal cultivators, there lived ${protagonist}. This remarkable individual's peaceful days in ${setting} were suddenly disrupted when ${plot}. 

During this perilous journey, our hero encountered ${antagonist}, who became a formidable obstacle. After numerous battles of wit and strength, when victory seemed within grasp, a shocking truth emerged: ${twist}.

This revelation changed everything, forcing our hero to reconsider their path on the road to immortality. For in the world of cultivation, nothing is as it first appears, and the dao is ever-changing.`
    
    // Format story message
    const storyText = `
*༺ MOUNT HUA CULTIVATION TALE ༻*

${story}

_"Every cultivator's journey writes its own legend."_
`
    
    // Send story
    m.reply(storyText)
    
    // Add XP for using command
    await db.addUserXP(m.sender, 6)
    
  } catch (error) {
    console.error('Error in story command:', error)
    m.reply('This young masters storytelling abilities are being hindered by malevolent spiritual energy.')
  }
}

export default {
  pattern: /^(story|tale|legend)$/i,
  handler,
  help: 'Generate a random cultivation story',
  tags: ['fun'],
  group: false,
  admin: false,
  owner: false
}