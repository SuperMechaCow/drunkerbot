const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    // !#buy <item ID> <quantity>
    //Another user can buy an item off the catalogue
    if (isNaN(args[0]) || isNaN(args[1])) {
        //If the ID or the quantity aren't numbers
        //Let the user know
        message.channel.send("I need numbers, bro.\n\n**!#buy <item ID> <quantity>**");
    } else {
        //Otherwise, find the item in the catalogue
        db.get("SELECT * FROM t_catalogue WHERE status = \'available\' AND in_stock >= " + args[1] + " AND TID = " + args[0] + ";", function(err, results) {
            if (results == undefined) {
                //If that item ID doesn't exist, let the user know
                message.channel.send("Could not find that item ID, there are not enough in stock, or you suck at typing. I don't know. If I were good at verbose error messages I wouldn't crash all of the damn time.");
            } else {
                //Otherwise, create a new order
                db.run("INSERT INTO t_orders (userdiscordID, serverdiscordID, catalogueTID, order_status, qty, order_date) VALUES (\'" + message.author.id + "\', \'" + results.seller_discordID + "\', " + results.TID + ", \'available\', " + args[1] + ", " + moment().unix() + ");", function(error) {
                    //Update item's in_stock quantity
                    db.run("UPDATE t_catalogue SET in_stock = " + parseInt(results.in_stock - args[1]) + " WHERE TID = " + args[0] + ";", function(error) {
                        if (!error) {
                            //If no error, let the user know
                            const embed = new Discord.RichEmbed()
                                .setTitle("New Purchase Order")
                                .setColor('GREEN')
                                .addField("Sold!", message.author.username + "#" + message.author.discriminator + " in " + discordClient.users.find(guild => guild.id === results.guild_discordID).name + " purchased " + args[1] + " of your " + results.cat_name + "!");
                            discordClient.users.find(user => user.id === results.seller_discordID).send({
                                embed
                            });
                        } else {
                            //Otherwise log an error
                            logger.error(error);
                            message.channel.send("Oh no! Something borked! Please check the bot logs.");
                        }
                    });
                });
            }
        });
    }
}
