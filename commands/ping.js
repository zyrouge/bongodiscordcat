 exports.run = (bongo, message, args, level) => {
   
   message.channel.send(`:ping_pong: Bongo Pong! **${bongo.ping}ms!**`);

};

exports.help = {
  name: "ping",
  aliases: []
}