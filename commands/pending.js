const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
    description: "", // Information about this command
    usage: settings.prefix + "", // How to use this command
    docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
    //This is a command template
    db.all(`SELECT * FROM t_playtests WHERE status = 'pending';`, function(error, results) {
        var embed = new Discord.MessageEmbed()
                embed.setTitle('**Pending Playtests**')
        results.forEach(function(result, index) {
            embed.addField(result.id, result.workshopID)
        });
                message.channel.send('', embed);
    });
}
