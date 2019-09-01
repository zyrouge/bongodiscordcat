module.exports = (bongo, message) => {
  const config = require("../config.json")
  const SQLite = require("better-sqlite3");
  const sql = new SQLite('./scores.sqlite');
  const giveaways = require("discord-giveaways");

  console.log(`Logged in as ${bongo.user.tag} in ${bongo.guilds.size} Servers`);
  bongo.user.setActivity(`bongodiscordcat.glitch.me | v${config.version} | ZyroBots`, {type: 'LISTENING'});
  bongo.user.setStatus('idle');
  const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
  if (!table['count(*)']) { sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
                            sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
                            sql.pragma("synchronous = 1");
                            sql.pragma("journal_mode = wal"); }
                            bongo.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
                            bongo.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");

        giveaways.launch(bongo, {
        updateCountdownEvery: 5000,
        botsCanWin: false,
        ignoreIfHasPermission: [
            "MANAGE_MESSAGES",
            "MANAGE_GUILD",
            "ADMINISTRATOR"
        ],
        embedColor: "#FF0000",
        reaction: "🎉",
        storage: __dirname+"/giveaways.json"
    });
  };
