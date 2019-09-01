exports.run = async (bongo, message, args, level) => { // eslint-disable-line no-unused-vars
  if (!args || args.length < 1) return message.reply("Must provide a command to reload. Derp.");
  const command = bongo.commands.get(args[0]) || bongo.commands.get(bongo.aliases.get(args[0]));
  let response = await bongo.unloadCommand(args[0]);
  if (response) return message.reply(`Error Unloading: ${response}`);

  response = bongo.loadCommand(command.help.name);
  if (response) return message.reply(`Error Loading: ${response}`);

  message.reply(`The command \`${command.help.name}\` has been reloaded`);
};

exports.help = {
  name: "reload",
  aliases: []
}