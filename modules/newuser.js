const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

const newuser = function(newuserauthor, newusermember) {
    db.run("INSERT INTO t_users (userDID, usernameDiscord, alerts, message_count, lastmessage, exp, updoots, downdoots, updooty, downdooty) VALUES (\'" + newuserauthor.id + "\', \'" + newuserauthor.username + "\', 0, 1, 0, 0, 0, 0, 0, 0);", function(err) {
        if (err) {
            logger.error(err);
        } else {
            // Let the user know if it succeeded
            logger.verbose("Created a new profile for: " + newuserauthor.username);
            newuserauthor.send("Hi! I created a new profile for you!\n\nYour alerts are set to false.\nUse \"!db alerts\" to sign up for alerts.");
        }
    });
}

module.exports = newuser;
