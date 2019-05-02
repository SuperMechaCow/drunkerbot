const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    //TODO: Remove userDname
    db.get("SELECT * FROM t_guilds WHERE guildDID = \'" + message.guild.id + "\';", function(err, SERVres) {
        if (err) {
            logger.error("Server query: " + err);
        } else {
            if (SERVres != undefined) {
                db.get("SELECT * FROM t_streams WHERE end IS NULL", function(err, results) {
                    if (err) {
                        logger.error("Stream query: " + err);
                    } else {
                        if (results == undefined) {
                            if (args[0] != null) {
                                //Validate the the URL here
                                db.run("INSERT INTO t_streams (guildDID, userDID, userDname, userAvatar, url, start) VALUES (\'" + message.guild.id + "\', \'" + message.author.id + "\', \'" + message.author.username + "\', \'" + message.author.displayAvatarURL + "\', \'" + args[0] + "\', " + moment().unix() + ");", function(err) {
                                    if (err) {
                                        logger.error("INSERT query: " + err);
                                    } else {
                                        logger.verbose(message.author.username + "#" + message.author.discriminator + " started a drunkerbox");
                                        message.member.addRole(SERVres.hostRoleDID);
                                        var statusdesc = message.guild.roles.get(SERVres.alertsRoleDID).toString() + "\n\n" + message.author.username + "#" + message.author.discriminator + " started a Drunkerbox Livestream!\n\n" + args[0];
                                        var embed = new Discord.RichEmbed()
                                            .setImage(message.author.displayAvatarURL)
                                            .addField("Drunkerbox Status", statusdesc)
                                            .setColor('GOLD');
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
            } else {
                logger.error("Guild not found.")
            }
        }
    });
}
