module.exports = (bongo, message) => {
  if (message.author.bot) return;

  if (message.content.indexOf(bongo.config.prefix) !== 0) return;

  const args = message.content.slice(bongo.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const cmd = bongo.commands.get(command) || bongo.commands.get(bongo.aliases.get(command));

  if (!cmd) return;

  cmd.run(bongo, message, args);
};
