const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const newuser = require('../modules/newuser.js');

//TODO: MAKE SURE THESE ARE ALSO CHANGED IN !HWF WHOIS
const TIMERRESET = 15; // Number of seconds before getting more exp
const LEVELMULTIPLIER = 100; // You need this much experience * your current level to level up
const MAXEXPGAIN = 5; // Each time you gain exp, it's between 0 and this number
const EXPMULTIPLIER = 5; // Then it's multiplied by this number

module.exports = (discordClient, message) => {
    // Ignore all bots
    if (message.author.bot) return;

    db.get("SELECT * FROM USER WHERE discordID = \'" + message.author.id + "\';", function(err, results) {
        if (results == undefined) {
            logger.warn("Couldn't find that user");
            db.get("SELECT * FROM USER WHERE username = \'" + message.author.username + "#" + message.author.discriminator + "\';", function(err, RECOVERres) {
                newuser(message.author, message.member);
            });
        } else {
            if (message.author.username != results.username) {
                db.run("UPDATE USER SET username = \'" + message.author.username + "\' WHERE discordID = \'" + message.author.id + "\';");
            }
            if (moment().unix() - results.lastmessage < TIMERRESET) {
                db.run("UPDATE USER SET messages = messages + 1 WHERE discordID = \'" + message.author.id + "\';");
            } else {
                var expbonus = (Math.floor(Math.random() * (MAXEXPGAIN + 1)) * EXPMULTIPLIER);
                db.run("UPDATE USER SET messages = messages + 1, lastmessage = " + moment().unix() + ", exp = exp + " + expbonus + " WHERE discordID = \'" + results.discordID + "\';", function() {
                    //Check to see if they leveled up here
                    var levelCount = 0;
                    var expCount = 0;
                    while (results.exp > expCount) {
                        levelCount++;
                        expCount = expCount + (levelCount * LEVELMULTIPLIER);
                    }
                    if (levelCount > results.lastlevel) {
                        db.run("UPDATE USER SET lastlevel = " + levelCount + " WHERE discordID = \'" + results.discordID + "\';");
                    }
                });
            }
        }
    });

    db.get("SELECT * FROM MESSAGES WHERE userdiscordID = \'" + message.author.id + "\' AND channeldiscordID = \'" + message.channel.id + "\' AND serverdiscordID = \'" + message.guild.id + "\';", function(error, results) {
        if (results == undefined) {
            logger.warn("Couldn't find that user/channel/server combo.");
            db.run("INSERT INTO MESSAGES (userdiscordID, channeldiscordID, serverdiscordID, messages) VALUES (\'" + message.author.id + "\', \'" + message.channel.id + "\', \'" + message.guild.id + "\', 1);", function(err) {
                logger.verbose("Created a message counter combo for: " + message.author.username);
            });
        } else {
            db.run("UPDATE MESSAGES SET messages = messages + 1 WHERE userdiscordID = \'" + message.author.id + "\' AND channeldiscordID = \'" + message.channel.id + "\' AND serverdiscordID = \'" + message.guild.id + "\';");
        }
    });

    const prefix = '!#';

    // Ignore messages not starting with the prefix (in config.json)
    if (message.content.indexOf(prefix) !== 0) return;

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
