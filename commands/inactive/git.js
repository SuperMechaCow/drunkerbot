const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    var statusdesc = "You can find my code at:\nhttps://github.com/SuperMechaCow/drunkerbot\n\n;
    var embed = new Discord.MessageEmbed()
    embed.addField("Event Git Repo", statusdesc)
    message.channel.send({
        embed
    });
}
