exports.run = (bongo, message) => {
   
    message.channel.send({embed:{color:16777215,title:'Click to goto Dashboard', url:'https://bongodiscordcat.glitch.me'}});
 
 };

exports.help = {
  name: "dsh",
  aliases: ["dashboard"]
}
