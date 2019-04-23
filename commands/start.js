const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    //TODO: PUT A JOIN HERE INSTEAD OF TWO QUERIES!!!
    db.get("SELECT * FROM t_guilds INNER JOIN t_streams ON t_guilds.guildDID = t_streams.guildDID WHERE t_guilds.guildDID = \'" + message.guild.id + "\';", function(err, results) {
        if (err) {
            logger.error(err);
        } else {
            if (results == undefined) {
                if (args[0] != null) {
                    //Validate the the URL here
                    db.run("INSERT INTO t_streams (guildDID, userDID, userAvatar, url, start) VALUES (\'" + message.guild.id + "\', \'" + message.author.id + "\', \'" + message.author.displayAvatarURL + "\', \'" + args[0] + "\', " + moment().unix() + ");");
                    logger.verbose(message.author.username + "#" + message.author.discriminator + " started a drunkerbox");
                    message.member.addRole(SERVERres.hostRoleDID);
                    var statusdesc = message.guild.roles.get(SERVERres.alertsRoleDID).toString() + "\n\n" + message.author.username + "#" + message.author.discriminator + " started a Drunkerbox Livestream!\n\n" + args[0];
                    var embed = new Discord.RichEmbed()
                        .setImage(message.author.displayAvatarURL)
                        .addField("Drunkerbox Status", statusdesc)
                        .setColor('BROWN');
                    message.channel.send({
                        embed
                    });
                    discordClient.user.setStatus('available');
                    discordClient.user.setPresence({
                        game: {
                            name: 'DrunkerBox',
                            type: "STREAMING",
                            url: args[0]
                        }
                    });
                } else {
                    logger.verbose(message.author.username + "#" + message.author.discriminator + " attempted to start a drunkerbox, but did not set a URL.")
                    message.author.send("Hey! You need to set the URL for the livestream!")
                }
            } else {
                logger.verbose("Stream is already active.");
            }
        }
    });
}
