const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    //TODO: COMBINE THESE TWO QUERIES INTO ONE WITH A JOIN
    db.get("SELECT * FROM SERVER WHERE discordID = \'" + message.guild.id + "\';", function(err, SERVERres) {
        db.all("SELECT * FROM USER WHERE discordID = \'" + message.author.id + "\';", function(err, results) {
            if (results == "") {
                console.log("Couldn't find that user");
                users.newuser(message.author, message.member);
                console.log("Created a new profile for: " + message.author.username + "#" + message.author.discriminator);
                // Let the user know if it succeeded
                message.member.addRole(SERVERres.alertRoleID).catch(console.error);
                message.author.send("Hi! I created a new profile for you!\n\nYour alerts are set to false.\nUse \"!db alerts\" to sign up for alerts.");
            } else {
                db.run("UPDATE USER SET alerts = " + !results[0].alerts + " WHERE discordID = \'" + message.author.id + "\';");
                message.member.removeRole(SERVERres.alertRoleID).catch(console.error);
                console.log(message.author.username + "#" + message.author.discriminator + " set their alerts to " + !results[0].alerts);
                message.author.send("You set your alerts to " + !results[0].alerts);
            }
        });
    });
}
