const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    if (args[0] && !isNaN(args[0])) {
        db.get("SELECT * FROM catalogue WHERE TID = \'" + args[0] + "\';", function(error, results) {
            if (results == undefined) {
                message.channel.send("Couldn't find that item!\n\n**!#details <Item ID>**");
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle(results.cat_name)
                    .setColor('GREEN')
                    .addField(discordClient.users.find(user => user.id === results.seller_discordID).username, results.cat_desc + "\n" + results.in_stock + " in stock [" + results.status + "]");
                message.channel.send({
                    embed
                });
            }
        });
    } else {
        message.channel.send("Bad parameters!\n\n**!#details <Item ID>**");
    }
}
