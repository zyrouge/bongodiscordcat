module.exports = async (bongo, member, message) => {
  const db = require("quick.db");
  const serverstats = new db.table('ServerStats');
  let sguildid = await serverstats.fetch(`Stats_${member.guild.id}`, { target: '.guildid' })
  let tusers = await serverstats.fetch(`Stats_${member.guild.id}`, { target: '.totusers' })
  let membs = await serverstats.fetch(`Stats_${member.guild.id}`, { target: '.membcount' })
  let bots = await serverstats.fetch(`Stats_${member.guild.id}`, { target: '.botcount' })
  
	const totalsize = member.guild.memberCount;
	const botsize = member.guild.members.filter(m => m.user.bot).size;
	const humansize = totalsize - botsize;
  
  if(member.guild.id === sguildid) { 
		member.guild.channels.get(tusers).setName("Total Users : " + member.guild.memberCount);
		member.guild.channels.get(membs).setName("Human Users : " + humansize);
		member.guild.channels.get(bots).setName("Bot Users : " + member.guild.members.filter(m => m.user.bot).size);
	}
};