//Keeps the bot ALIVE for infinite time UwU
const express = require('express');
const keepalive = require('express-glitch-keepalive');
 
const app = express();
 
app.use(keepalive);

//Something weird

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


//Bongo Code Starts Here
const Discord = require("discord.js");
const bongo = new Discord.Client();
const fs = require('fs');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const api = require('some-random-api');


const youtube = new YouTube(process.env.YTTOKEN);
const queue = new Map();
const Util = require('discord.js');

const config = require('./config.json');

bongo.on("ready", () => {
  console.log(`Logged in as ${bongo.user.tag} in ${bongo.guilds.size} Servers`);
  bongo.user.setActivity(`b!help | bongodiscordcat.glitch.me | ZyroBots`, {type: 'LISTENING'});
  bongo.user.setStatus('idle');
});

//Some Handlers
function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

//Commands
bongo.on("message", async message => {
  if(message.author.bot) return;

  //Chat Bot
  if (message.channel.name === "bongo-chat") {
    
    let input = message.content;
    message.channel.startTyping();
    let output = await api.chat(input)
    message.channel.stopTyping();
    return message.reply(output)
  }

  if(message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "ping" || command === "bongoping") {
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

  if(command === '8ball') {
    function bongoball() {
      var rand = ['Yes', 'No', 'Why are you even trying?', 'What do you think? NO', 'Maybe', 'Never', 'Yep'];
  
      return rand[Math.floor(Math.random()*rand.length)];
  }
  message.channel.send('Bongo\'s anwser is: **' + bongoball() + '**');
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
  .addField("Moderation", "`Kick`, `Ban`")
  .setURL("https://bongodiscordcat.glitch.me");
  message.channel.send(helpembed);
}

 if(command === 'invite') {
   message.channel.send({embed:{color:16777215, title:`My Bongo Invite Link:`, description:`[Click To Invite](https://discordapp.com/api/oauth2/authorize?client_id=614476694853779457&permissions=2146958847&scope=bot) | [Join Our Support Server](https://discord.gg/8jdDWzk)`,
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