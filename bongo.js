//Keeps the bot ALIVE for infinite time UwU
const express = require('express');
const keepalive = require('express-glitch-keepalive');
const app = express();

let port = require('./config.json').port || 3000;
app.set('port', port);

const session = require('express-session');

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(session({
    secret: '48738924783748273742398747238',
    resave: false,
    saveUninitialized: false,
    expires: 604800000,
}));
require('./router')(app);

app.listen(port, () => console.info(`Listening on port ${port}`));

//Bongo Code Starts Here
const Discord = require("discord.js");
const bongo = new Discord.Client();
const fs = require('fs');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const api = require('some-random-api');
const Enmap = require("enmap");
const SQLite = require("better-sqlite3");
const db = require("quick.db");
const sql = new SQLite('./scores.sqlite');
const eco = require("discord-economy");
const youtube = new YouTube(process.env.YTTOKEN);
const queue = new Map();
const giveaways = require("discord-giveaways");
const ms = require("ms");
const Util = require('discord.js');
const config = require('./config.json');
bongo.config = config;

//Event Handlers
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    // If the file is not a JS file, ignore it (thanks, Apple)
    if (!file.endsWith(".js")) return;
    // Load the event file itself
    const event = require(`./events/${file}`);
    // Get just the event name from the file name
    let eventName = file.split(".")[0];
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    // without going into too many details, this means each event will be called with the client argument,
    // followed by its "normal" arguments, like message, member, etc etc.
    // This line is awesome by the way. Just sayin'.
    bongo.on(eventName, event.bind(null, bongo));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});

//Command Handlers
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
bongo.commands = new Enmap();
bongo.aliases = new Enmap();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    // Load the command file itself
    let props = require(`./commands/${file}`);
    // Get just the command name from the file name
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    // Here we simply store the whole thing in the command Enmap. We're not running it right now.
    bongo.commands.set(props.help.name, props);
    props.help.aliases.forEach(alias => {
        bongo.aliases.set(alias, props.help.name);
      });
  });
});

//Eval Handler
function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

bongo.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});

const defaultSettings = {
  prefix: "b!"
}

bongo.on("guildDelete", guild => {
  // When the bot leaves or is kicked, delete settings to prevent stale entries.
  bongo.settings.delete(guild.id);
});

//Commands
bongo.on("message", async message => {
  if (message.author.bot) return;
  
  
  let score;
    score = bongo.getScore.get(message.author.id, message.guild.id);
    if (!score) {
      score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 }
    }
    score.points++;
    let curLevel = Math.floor(0.1 * Math.sqrt(score.points));
    if(score.level <= curLevel) {
      score.level++;
      message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
    }
    bongo.setScore.run(score);
  
  //Chat Bot
  if (message.channel.name === "bongo-chat") {
    
    let input = message.content;
    message.channel.startTyping();
    let output = await api.chat(input)
    message.channel.stopTyping();
    return message.reply(output)
  }
  
  const guildConf = bongo.settings.ensure(message.guild.id, defaultSettings);
  if(message.content.indexOf(guildConf.prefix) !== 0) return;
  const args = message.content.split(/\s+/g);
  const command = args.shift().slice(guildConf.prefix.length).toLowerCase();
  
  
  if(command === "setconf" || command=== "config") {

    // Let's get our key and value from the arguments. 
    // This is array destructuring, by the way. 
    const [prop, ...value] = args;

    if(!bongo.settings.has(message.guild.id, prop)) {
      return message.reply("This key is not in the configuration.");
    }
    
    // Now we can finally change the value. Here we only have strings for values 
    // so we won't bother trying to make sure it's the right type and such. 
    bongo.settings.set(message.guild.id, value.join(" "), prop);
    
    // We can confirm everything's done to the client.
    message.channel.send(`Guild configuration item ${prop} has been changed to:\n\`${value.join(" ")}\``);
  }
  
  if(command === "points" || command === 'level') {
  return message.reply(`You currently have ${score.points} points and are level ${score.level}!`);
}
  
  if(command === "give") {
  // Limited to guild owner - adjust to your own preference!
  if(!message.author.id === message.guild.owner) return message.reply("You're not the boss of me, you can't do that!");

  const user = message.mentions.users.first() || bongo.users.get(args[0]);
  if(!user) return message.reply("You must mention someone or give their ID!");

  const pointsToAdd = parseInt(args[1], 10);
  if(!pointsToAdd) return message.reply("You didn't tell me how many points to give...")

  // Get their current points.
  let userscore = bongo.getScore.get(user.id, message.guild.id);
  // It's possible to give points to a user we haven't seen, so we need to initiate defaults here too!
  if (!userscore) {
    userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 1 }
  }
  userscore.points += pointsToAdd;

  // We also want to update their level (but we won't notify them if it changes)
  let userLevel = Math.floor(0.1 * Math.sqrt(score.points));
  userscore.level = userLevel;

  // And we save it!
  bongo.setScore.run(userscore);

  return message.channel.send(`${user.tag} has received ${pointsToAdd} points and now stands at ${userscore.points} points.`);
}

  if (command === 'balance' || command === "bal") {
 
    var output = await eco.FetchBalance(message.author.id)
    message.channel.send(`Hey ${message.author.tag}! You own ${output.balance} coins.`);
  }
  
  if (command === 'daily') {
 
    var output = await eco.Daily(message.author.id)
    //output.updated will tell you if the user already claimed his/her daily yes or no.
 
    if (output.updated) {
 
      var profile = await eco.AddToBalance(message.author.id, 100)
      message.reply(`You claimed your daily coins succesfully! You now own ${profile.newbalance} coins.`);
 
    } else {
      message.channel.send(`Sorry, you already claimed your daily coins!\nBut no worries, over ${output.timetowait} you can daily again!`)
    }
 
  }

 
  if (command === 'resetdaily') {
 
    var output = await eco.ResetDaily(message.author.id)
 
    message.reply(output) //It wil send 'Daily Reset.'
 
  }
  
  if(command === 'vckick'){
    
    if (!message.guild.me.hasPermission(['MANAGE_CHANNELS', 'MOVE_MEMBERS'])) return message.reply('Missing the required `Move Members` permission.');

// Get the mentioned user/bot and check if they're in a voice channel:
const member = message.mentions.members.first();
if (!member) return message.reply('You need to @mention a user/bot to kick from the voice channel.');
if (!member.voiceChannel) return message.reply('That user/bot isn\'t in a voice channel.');

// Now we set the member's voice channel to null, in other words disconnecting them from the voice channel.
member.setVoiceChannel(null);

// Finally, pass some user response to show it all worked out:
message.react('👌');
    
  }
 
  if (command === 'ecoleaderboard' || command === 'ecolb') {
 
    //If you use discord-economy guild based you can use the filter() function to only allow the database within your guild
    //(message.author.id + message.guild.id) can be your way to store guild based id's
    //filter: x => x.userid.endsWith(message.guild.id)
 
    //If you put a mention behind the command it searches for the mentioned user in database and tells the position.
    if (message.mentions.users.first()) {
 
      var output = await eco.Leaderboard({
        filter: x => x.balance > 50,
        search: message.mentions.users.first().id
      })
      message.channel.send(`The user ${message.mentions.users.first().tag} is number ${output} on my leaderboard!`);
 
    } else {
 
      eco.Leaderboard({
        limit: 3, //Only takes top 3 ( Totally Optional )
        filter: x => x.balance > 50 //Only allows people with more than 100 balance ( Totally Optional )
      }).then(async users => { //make sure it is async
 
        if (users[0]) var firstplace = await bongo.fetchUser(users[0].userid) //Searches for the user object in discord for first place
        if (users[1]) var secondplace = await bongo.fetchUser(users[1].userid) //Searches for the user object in discord for second place
        if (users[2]) var thirdplace = await bongo.fetchUser(users[2].userid) //Searches for the user object in discord for third place
 
        message.channel.send(`My leaderboard:
 
1 - ${firstplace && firstplace.tag || 'Nobody Yet'} : ${users[0] && users[0].balance || 'None'}
2 - ${secondplace && secondplace.tag || 'Nobody Yet'} : ${users[1] && users[1].balance || 'None'}
3 - ${thirdplace && thirdplace.tag || 'Nobody Yet'} : ${users[2] && users[2].balance || 'None'}`)
 
      })
 
    }
  }
 
  if (command === 'transfer' || command === "share") {
 
    var user = message.mentions.users.first()
    var amount = args[1]
 
    if (!user) return message.reply('Reply the user you want to send money to!')
    if (!amount) return message.reply('Specify the amount you want to pay!')
 
    var output = await eco.FetchBalance(message.author.id)
    if (output.balance < amount) return message.reply('You have less coins than the amount you want to transfer!')
 
    var transfer = await eco.Transfer(message.author.id, user.id, amount)
    message.reply(`Transfering coins succesfully done!\nBalance from ${message.author.tag}: ${transfer.FromUser}\nBalance from ${user.tag}: ${transfer.ToUser}`);
  }
 
  if (command === 'coinflip' || command === 'flipcoin') {
 
    var flip = args[0] //Heads or Tails
    var amount = args[1] //Coins to gamble
 
    if (!flip || !['heads', 'tails'].includes(flip)) return message.reply('Pls specify the flip, either heads or tails!')
    if (!amount) return message.reply('Specify the amount you want to gamble!')
 
    var output = await eco.FetchBalance(message.author.id)
    if (output.balance < amount) return message.reply('You have less coins than the amount you want to gamble!')
 
    var gamble = await eco.Coinflip(message.author.id, flip, amount).catch(console.error)
    message.reply(`You ${gamble.output}! New balance: ${gamble.newbalance}`)
 
  }
 
  if (command === 'dice') {
 
    var roll = args[0] //Should be number between 1 and 6
    var amount = args[1] //Coins to gamble
 
    if (!roll || ![1, 2, 3, 4, 5, 6].includes(parseInt(roll))) return message.reply('Specify the roll, it should be a number between 1-6')
    if (!amount) return message.reply('Specify the amount you want to gamble!')
 
    var output = eco.FetchBalance(message.author.id)
    if (output.balance < amount) return message.reply('You have less coins than the amount you want to gamble!')
 
    var gamble = await eco.Dice(message.author.id, roll, amount).catch(console.error)
    message.reply(`The dice rolled ${gamble.dice}. So you ${gamble.output}! New balance: ${gamble.newbalance}`)
 
  }
 
  if (command === 'work') { //I made 2 examples for this command! Both versions will work!
 
    var output = await eco.Work(message.author.id, {
      failurerate: 10,
      money: Math.floor(Math.random() * 500),
      jobs: ['cashier', 'shopkeeper']
    })
    //10% chance to fail and earn nothing. You earn between 1-500 coins. And you get one of those 3 random jobs.
    if (output.earned == 0) return message.reply('Aww, you did not do your job well so you earned nothing!')
 
    message.channel.send(`${message.author.username}
You worked as a \` ${output.job} \` and earned :money_with_wings: ${output.earned}
You now own :money_with_wings: ${output.balance}`)
 
  }
  
if(command === "leaderboard" || command === "lb") {
  const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);

    // Now shake it and show it! (as a nice embed, too!)
  const embed = new Discord.RichEmbed()
    .setTitle("Leaderboard")
    .setAuthor(bongo.user.username, bongo.user.avatarURL)
    .setDescription("Our top 10 points leaders!")
    .setColor(0x00AE86);

  for(const data of top10) {
    embed.addField(bongo.users.get(data.user).tag, `${data.points} points (level ${data.level})`);
  }
  return message.channel.send({embed});
}
  
  if(command === "showconf" || command=== "showconfig") {
    let configProps = Object.keys(guildConf).map(prop => {
      return `${prop}  :  ${guildConf[prop]}\n`;
    });
    message.channel.send(`The following are the server's current configuration:
    \`\`\`${configProps}\`\`\``);
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
  
  if(command === "ban" || command ==="bean") {
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


 if(command === 'avatar') {
   const avatarembed = new Discord.RichEmbed()
    .setColor(16777215)
    .setImage(`${message.author.avatarURL}`);
   message.channel.send(avatarembed);
 }

 if(command === 'help' || command === 'commands' || command === 'cmds' ) {
  const helpembed = new Discord.RichEmbed()
  .setTitle("All Commands")
  .setColor(16777215)
  .setFooter("Bongo Cat",`${bongo.user.avatarURL}`)
  .setTimestamp()
  .addField("Visit Website for Info", `[Support Server](https://discordapp.com/invite/8jdDWzk) | [ZyroBots](https://zyrobots.ga) | [GitHub](https://github.com/zyrouge/)`)
  .setURL("https://bongodiscordcat.glitch.me");
  message.channel.send(helpembed);
}

 if(command === 'invite') {
   message.channel.send({embed:{color:16777215, title:`My Bongo Invite Link:`, description:`[Click To Invite](https://discordapp.com/oauth2/authorize?client_id=614476694853779457&permissions=2146958847&redirect_uri=https%3A%2F%2Fbongodiscordcat.glitch.me&response_type=code&scope=bot%20guilds.join) | [Join Our Support Server](https://discord.gg/8jdDWzk)`,
                               footer:{text:'Bongo Cat'}
                               }});
 }

 const evalargs = message.content.split(" ").slice(1);
 if(command === 'eval') {
  if(message.author.id !== config.ownerID) return;
  try {
    const code = evalargs.join(" ");
    let evaled = eval(code);

    if (typeof evaled !== "string")
      evaled = require("util").inspect(evaled);

    message.channel.send(clean(evaled), {code:"xl"}); } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``); }
 }

 //Music Code Starts Here
  const searchargs = message.content.split(' ');
	const searchString = searchargs.slice(1).join(' ');
	const url = searchargs[1] ? searchargs[1].replace(/<(.+)>/g, '$1') : '';
  const serverQueue = queue.get(message.guild.id);
  
  if (command === 'play'  || command === 'p') {
		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
		const permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) {
			return message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		}
		if (!permissions.has('SPEAK')) {
			return message.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return message.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					message.channel.send(`
__**Song selection:**__
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
Please provide a value to select one of the search results ranging from 1-10.
					`);
					// eslint-disable-next-line max-depth
					try {
						var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return message.channel.send('No or invalid value entered, cancelling video selection.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return message.channel.send('🆘 I could not obtain any search results.');
				}
			}
			return handleVideo(video, message, voiceChannel);
		}
	} else if (command === 'skip' || command === 'sk') {
		if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
		if (!serverQueue) return message.channel.send('There is nothing playing that I could skip for you.');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === 'stop' || command === 'st' || command === 'dc') {
		if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
		if (!serverQueue) return message.channel.send('There is nothing playing that I could stop for you.');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		return undefined;
	} else if (command === 'volume' || command === 'vol') {
		if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		if (!searchargs[1]) return message.channel.send(`The current volume is: **${serverQueue.volume}**`);
		serverQueue.volume = searchargs[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(searchargs[1] / 5);
		return message.channel.send(`I set the volume to: **${searchargs[1]}**`);
	} else if (command === 'np' || command === 'nowplaying') {
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		return message.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
	} else if (command === 'queue' || command === 'q') {
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		return message.channel.send(`
__**Song queue:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
**Now playing:** ${serverQueue.songs[0].title}
		`);
	} else if (command === 'pause' || command === 'pa') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return message.channel.send('⏸ Paused the music for you!');
		}
		return message.channel.send('There is nothing playing.');
	} else if (command === 'resume' || command === 're') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return message.channel.send('▶ Resumed the music for you!');
		}
		return message.channel.send('There is nothing playing.');
	}

	return undefined;

});


//Some Music Queue Functions
async function handleVideo(video, message, voiceChannel, playlist = false) {
	const serverQueue = queue.get(message.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(message.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(message.guild.id);
			return message.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return message.channel.send(`✅ **${song.title}** has been added to the queue!`);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);
}


//Bot Credentials
bongo.login(process.env.TOKEN);