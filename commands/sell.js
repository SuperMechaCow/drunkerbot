const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    //**!#sell <quantity> <USD price> \"<Name>\" \"<Description>\"**
    //Find the parts in quotes
    var desc = message.content.split(/\"+/g);
    //Go through all results and remove empty spaces
    desc.forEach(function(item, index) {
        if (desc[index] == " ")
            desc.splice(index, 1)
    });
    if (!args[0] || !args[1] || !desc[1] || !desc[2]) {
        //If any of the required params were not set, or the quantity or
        message.channel.send("You seem to be missing some parameters.\n\n**!#sell <quantity> <USD price> \"<Name>\" \"<Description>\"**");
    } else if (isNaN(args[0]) || isNaN(args[1])) {
        //If the quantity or price were not numbers
        message.channel.send("Make sure you quantity and price are numbers, with no currency symbols (assumes USD)\n\n**!#sell <quantity> <USD price> \"<Name>\" \"<Description>\"**");
    } else {
        //Create a temporary object so we can send a SQL query more easily
        var sellObj = {
            'qty': args[0],
            'price': args[1],
            'name': desc[1],
            'desc': desc[2]
        };
        //Insert a new item into the catalogue table using the prior
        db.run("INSERT INTO t_catalogue (seller_discordID, guild_discordID, cat_name, cat_desc, in_stock, status) VALUES (\'" + message.author.id + "\', \'" + message.guild.id + "\', \'" + sellObj.name + "\', \'" + sellObj.desc + "\', \'" + sellObj.qty + "\', \'available\');", function(error) {
            if (!error) {
                //If there's no error, let the user know
                message.channel.send("Thanks! I've listed that for you!");
            } else {
                //Otherwise log an error
                logger.error(error);
                message.channel.send("Oh no! Something borked! Please check the bot logs.");
            }
        });
    }
}
