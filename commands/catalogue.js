const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    db.all("SELECT * FROM catalogue WHERE status = \'available\' AND in_stock > 0;", function(error, results) {
        if (results == "") {
            message.channel.send("There is nothing for sale.");
        } else {
            const embed = new Discord.RichEmbed()
                .setTitle("Trading Post Catalogue")
                .setColor('GREEN');
            results.forEach(function(item, index) {
                embed.addField(item.cat_name + " [ID: " + item.TID + "]", item.cat_desc + "\n" + item.in_stock + " in stock.\n[" + discordClient.users.find(user => user.id === item.seller_discordID).username + "]");
            });
            message.channel.send({
                embed
            });
        }
    });
}
