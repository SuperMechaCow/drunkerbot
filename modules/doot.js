const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

const logger = require('../modules/log.js');
const newuser = require('../modules/newuser.js');

function doot(dootUser, dootemoji, adjust) {

    if (dootUser.bot) return;

    //This is sloppy code, I know.
    if (dootemoji === "upvote" || dootemoji === "downvote" || dootemoji === "updoot" || dootemoji === "downdoot") {
        //Find user in database (create new function that does this)
        db.get("SELECT * FROM  t_users WHERE discordID = \'" + dootUser.id + "\';", function(err, results) {
            if (results == undefined) {
                logger.warn("Couldn't find that user: " + dootUser.id + "#" + dootUser.discriminator);
                newuser(dootUser);
            }
            //save to db
            if (dootemoji === "upvote") {
                db.run("UPDATE  t_users SET updoots = updoots + " + adjust + " WHERE discordID = \'" + dootUser.id + "\';");
            }
            if (dootemoji === "downvote") {
                db.run("UPDATE  t_users SET downdoots = downdoots + " + adjust + " WHERE discordID = \'" + dootUser.id + "\';");
            }
        });
    }
}

module.exports = doot;
