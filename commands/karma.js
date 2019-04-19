const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

const DOOTEE_BONUS = 1;
const DOOTER_BONUS = 0.25;

exports.run = (discordClient, message, args) => {
    if (!message.mentions.users.size) {
        var karmauser = message.author;
        var karmamember = message.member;
    } else {
        var karmauser = message.mentions.users.first();
        var karmamember = message.mentions.members.first();
    }

    db.get("SELECT * FROM USER WHERE discordID = \'" + karmauser.id + "\';", function(err, results) {
        if (results == "") {
            logger.warn("Couldn't find that user");
            users.newuser(karmauser, karmamember);
            message.channel.send(message.mentions.users.first() + " didn\'t have a profile so I made one without their permission. They'll thank me later.");
        } else {
            var embed = new Discord.RichEmbed()
            var statusdesc = "Updoots: " + results.updoots + "\nDowndoots: " + results.downdoots + "\nUpdoot Ratio: " + parseInt((results.updoots - results.downdoots) / DOOTEE_BONUS) / results.messages;
            embed.addField(karmauser.username + "#" + karmauser.discriminator + "\nKarma Score:", statusdesc);
            message.channel.send({
                embed
            });
        }
    });
}
