//Keeps the bot ALIVE for infinite time UwU
const express = require('express');
const keepalive = require('express-glitch-keepalive');
 
const app = express();
 
app.use(keepalive);
 
app.get('/', (req, res) => {
  res.json('Ok');
});

//Bongo Code Starts Here
const Discord = require("discord.js");
const bongo = new Discord.Client();
const fs = require('fs');

const config = require('./config.json');

bongo.on("ready", () => {
  console.log(`Logged in as ${bongo.user.tag} in ${bongo.guilds.size} Servers`);
  bongo.user.setActivity(`Bongo Vids | b!help | ${bongo.guilds.size} Servers`, {type: 'WATCHING'});
  bongo.user.setStatus('idle');
});

//Commands
bongo.on("message", async message => {
  if(message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "ping") {
    const m = await message.channel.send("Bongo is Pinging the time to Revolve the World!");
    m.edit(`:ping_pong: Bongo Pong! **${bongo.ping}ms!**`);
  }
  
  if(command === "say") {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{}); 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    if(!message.member.hasPermission("KICK_MEMBERS"))
      return message.reply("Sorry, you don't have permissions to use this!");
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.kick(reason)
      .catch(error => message.reply(`Sorry **${message.author}** I couldn't kick because of : *${error}*`));
    message.reply(`**${member.user.tag}** has been kicked by **${message.author.tag}** because: *${reason}*`);

  }
  
  if(command === "ban") {
    if(!message.member.hasPermission("BAN_MEMBERS"))
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry **${message.author}** I couldn't ban because of : *${error}*`));
    message.reply(`**${member.user.tag}** has been banned by **${message.author.tag}** because: *${reason}*`);
  }
  
  if(command === "purge") {
    const deleteCount = parseInt(args[0], 10);
      if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }

  if(command === "beep") {
    message.channel.send('Boop!');
  }

  if(command === '8ball') {
    function bongoball() {
      var rand = ['Yes', 'No', 'Why are you even trying?', 'What do you think? NO', 'Maybe', 'Never', 'Yep'];
  
      return rand[Math.floor(Math.random()*rand.length)];
  }
  message.channel.send('Bongo\'s anwser is: **' + bongoball() + '**');
}

 if(command === 'avatar') {
   message.channel.send(`${message.author.avatarURL}`);
 }

 if(command === 'help' || command === 'commands' || command === 'cmds' ) {
  message.channel.send({embed:{ 
    title:'Bongo Commands. Prefix - b!',
    description:'\n**All Commands:** \n`Kick`, `Ban`, `Avatar`, `8Ball`, `Beep`, `Purge`, `Say`, `Ping`'
}});
}

 if(command === 'invite') {
   message.channel.send(`My Bongo Invite Link: https://discordapp.com/api/oauth2/authorize?client_id=614476694853779457&permissions=2146958847&scope=bot`);
 }
});


//Bot Credentials
bongo.login(process.env.TOKEN);