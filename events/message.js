const Enmap = require("enmap");
module.exports = (bongo, message) => {
  if (message.author.bot) return;  
  
  bongo.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});

const defaultSettings = {
  prefix: "b!"
}

  const guildConf = bongo.settings.ensure(message.guild.id, defaultSettings);
  
  const prefixMention = new RegExp(`^<@!?${bongo.user.id}>( |)$`);
  if (message.content.match(prefixMention)) {
    return message.reply(`My prefix on this guild is \`${guildConf.prefix}\``);
  }
  
  if(message.content.indexOf(guildConf.prefix) !== 0) return;
  const args = message.content.split(/\s+/g);
  const command = args.shift().slice(guildConf.prefix.length).toLowerCase();

  const cmd = bongo.commands.get(command) || bongo.commands.get(bongo.aliases.get(command))

  if (!cmd) return;

  cmd.run(bongo, message, args);
};