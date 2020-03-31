const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

//TODO: Give drunkerhost badge

exports.run = (discordClient, message, args) => {
    db.get("SELECT * FROM t_guilds INNER JOIN t_events ON t_guilds.guildDID = t_events.guildDID WHERE t_guilds.guildDID = \'" + message.guild.id + "\';", function(err, results) {
        if (err) {
            logger.error(err);
        } else {
            if (message.member.roles.has(results.modRoleID) || results.userDID == message.author.id) {
                if (results != undefined) {
                    db.run("UPDATE t_events SET end = " + moment().unix() + " WHERE end IS NULL AND guildDID = \'" + message.guild.id + "\';", function(err) {
                        if (err) {
                            logger.error(err);
                        } else {
                            logger.verbose(message.author.username + "#" + message.author.discriminator + " stopped the event");
                            message.channel.send(message.author.username + "#" + message.author.discriminator + " stopped the event");
                            message.member.removeRole(results.hostRoleDID).catch(console.error);
                            discordClient.user.setStatus('idle')
                            discordClient.user.setPresence({
                                game: {
                                    name: 'none',
                                    type: "none",
                                    url: 'none'
                                }
                            });
                        }
                    });
                } else {
                    message.channel.send("Stream is not currently active.");
                    logger.verbose("Stream is not currently active.");
                }
            } else {
                message.channel.send("Nice try, but only the Host or a Moderator can stop an event stream!")
            }
        }
    });
}
