 exports.run = (bongo, message, args, level) => {
   
function bongoball() {
      var rand = ['Yes', 'No', 'Why are you even trying?', 'What do you think? NO', 'Maybe', 'Never', 'Yep'];
  
      return rand[Math.floor(Math.random()*rand.length)];
  }
  message.channel.send('Bongo\'s anwser is: **' + bongoball() + '**');
};

exports.help = {
  name: "8ball",
  aliases: ["eightball"]
}