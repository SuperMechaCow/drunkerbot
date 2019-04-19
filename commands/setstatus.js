const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    db.all("SELECT * FROM catalogue WHERE seller_discordID = \'" + message.author.id + "\';", function(error, results) {
        if (results == "") {
            message.channel.send("You do not have anything listed for sale.");
        } else {
            var foundItem = false;
            results.forEach(function(item, index) {
                if (item.TID == args[0]) {
                    foundItem = true;
                    switch (args[1]) {
                        case 'available':
                        case 'unavailable':
                            message.channel.send("I changed that for you.");
                            db.run("UPDATE catalogue SET status = \'" + args[1] + "\' WHERE TID = " + args[0] + ";")
                            break;
                        default:
                            message.channel.send("Invalid status. Try **\'available\'** or **'unavailable\'**.");
                            break;
                    }
                }
            });
            if (!foundItem) {
                message.channel.send("Couldn't find that item ID in the catalogue.");
            }
        }
    });
}
