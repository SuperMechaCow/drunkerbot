const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

//TODO: Using karma, whois, or any mentions that create new users will create two entries for new users who use it on themselves

module.exports = (discordClient, guild) => {
    db.run("INSERT INTO t_guilds (guildDID, guildName, homeDID, spamDID) VALUES (\'" + guild.id + "\', \'" + guild.name + "\', \'" + guild.systemChannel.id + "\', \'" + guild.systemChannel.id + "\');", function(err) {
        if (err) {
            logger.error(err);
        } else {
            logger.verbose("Added " + guild.name + " to guilds.");
        }
    });
}
