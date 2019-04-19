const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    db.get("SELECT * FROM SERVER WHERE discordID = \'" + message.guild.id + "\';", function(err, SERVERres) {
        db.get("SELECT * FROM STREAM WHERE serverdiscordID = \'" + message.guild.id + "\'AND state = 1;", function(err, results) {
            if (message.member.roles.has(SERVERres.modRoleID) || drunkerstatus.userdiscordID == message.author.id) {
                if (results != undefined) {
                    db.run("UPDATE STREAM SET end = " + moment().unix() + ", state = 0 WHERE state = 1;");
                    logger.verbose(message.author.username + "#" + message.author.discriminator + " stopped the drunkerbox");
                    message.channel.send(message.author.username + "#" + message.author.discriminator + " stopped the drunkerbox");
                    message.member.removeRole(SERVERres.hostRoleID).catch(console.error);
                    discordClient.user.setStatus('idle')
                    discordClient.user.setPresence({
                        game: {
                            name: 'none',
                            type: "none",
                            url: 'none'
                        }
                    });
                } else {
                    message.channel.send("Stream is not currently active.");
                    logger.verbose("Stream is not currently active.");
                }
            } else {
                message.channel.send("Nice try, but only the Host or a Moderator can stop a drunkerbox stream!")
            }
        });
    });
}
