const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const newuser = require('../modules/newuser.js');

exports.run = (discordClient, message, args) => {
    //TODO: COMBINE THESE TWO QUERIES INTO ONE WITH A JOIN
    db.get("SELECT * FROM t_guilds INNER JOIN t_users ON t_users.userDID = t_users.userDID WHERE t_users.userDID = \'" + message.author.id + "\';", function(err, results) {
        if (err) {
            logger.error(err);
        } else {
            if (results == undefined) {
                console.log("Couldn't find that user");
                newuser(message.author, message.guild.id);
                console.log("Created a new profile for: " + message.author.username + "#" + message.author.discriminator);
                // Let the user know if it succeeded
                message.member.addRole(results.alertsRoleDID).catch(console.error);
                message.author.send("Hi! I created a new profile for you!\n\nYour alerts are set to false.\nUse \"!db alerts\" to sign up for alerts.");
            } else {
                db.run("UPDATE t_users SET alerts = " + !results.alerts + " WHERE userDID = \'" + message.author.id + "\';");
                message.member.removeRole(results.alertsRoleDID).catch(console.error);
                logger.verbose(message.author.username + "#" + message.author.discriminator + " set their alerts to " + !results.alerts);
                message.author.send("You set your alerts to " + !results.alerts);
            }
        }
    });
}
