const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const newuser = require('../modules/newuser.js');
const settings = require('../modules/settings.js');

//TODO: Using karma, whois, or any mentions that create new users will create two entries for new users who use it on themselves

module.exports = (discordClient, message) => {
    // Ignore all bots
    if (message.author.bot) return;

    const prefix = '!#';

    // Only messages without the prefix get counted, to avoid database collisions
    // Then return without doing anything else
    if (message.content.indexOf(prefix) !== 0 && message.channel.type == 'text') {
        db.get("SELECT * FROM t_users WHERE userDID = \'" + message.author.id + "\' AND guildDID = \'" + message.guild.id + "\';", function(err, results) {
            if (err) {
                logger.error(message.author.username + ": \'" + message.content + "\'\n" + err)
            } else {
                if (results == undefined) {
                    logger.warn("Couldn't find that user");
                    newuser(message.author, message.guild.id);
                } else {
                    if (message.author.username != results.usernameDiscord) {
                        db.run("UPDATE t_users SET usernameDiscord = \'" + message.author.username + "\' WHERE userDID = \'" + message.author.id + "\';");
                    }
                    if (moment().unix() - results.lastmessage < settings.TIMERRESET) {
                        db.run("UPDATE t_users SET message_count = message_count + 1 WHERE userDID = \'" + message.author.id + "\';");
                    } else {
                        var expbonus = (Math.floor(Math.random() * (settings.MAXEXPGAIN + 1)) * settings.EXPMULTIPLIER);
                        db.run("UPDATE t_users SET message_count = message_count + 1, lastmessage = " + moment().unix() + ", exp = exp + " + expbonus + " WHERE userDID = \'" + results.userDID + "\';", function() {
                            //Check to see if they leveled up here
                            var levelCount = 0;
                            var expCount = 0;
                            while (results.exp > expCount) {
                                levelCount++;
                                expCount = expCount + (levelCount * settings.LEVELMULTIPLIER);
                            }
                            if (levelCount > results.lastlevel) {
                                db.run("UPDATE t_users SET lastlevel = " + levelCount + " WHERE userDID = \'" + results.userDID + "\';");
                            }
                        });
                    }
                }
            }
        });

        db.get("SELECT * FROM t_messages WHERE userDID = \'" + message.author.id + "\' AND channelDID = \'" + message.channel.id + "\' AND guildDID = \'" + message.guild.id + "\';", function(err, results) {
            if (err) {
                logger.error(err)
            } else {
                if (results == undefined) {
                    logger.warn("Couldn't find that user/channel/server combo.");
                    db.run("INSERT INTO t_messages (userDID, channelDID, guildDID, message_count) VALUES (\'" + message.author.id + "\', \'" + message.channel.id + "\', \'" + message.guild.id + "\', 1);", function(err) {
                        logger.verbose("Created a message counter combo for: " + message.author.username);
                    });
                } else {
                    db.run("UPDATE t_messages SET message_count = message_count + 1 WHERE userDID = \'" + message.author.id + "\' AND channelDID = \'" + message.channel.id + "\' AND guildDID = \'" + message.guild.id + "\';", function(error) {
                        if (error)
                            logger.error(error);
                    });
                }
            }
        });

        return;
    }

    // Our standard argument/command name definition.
    //This code isn't looking for a prefix. It's just removing the first letter
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Grab the command data from the discordClient.commands Enmap
    const cmd = discordClient.commands.get(command);

    // If that command doesn't exist, silently exit and do nothing
    if (!cmd) return;

    // Run the command
    cmd.run(discordClient, message, args);
};
