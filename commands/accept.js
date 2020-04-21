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

//TODO: Error if no results were found
//TODO: Error if ID not provided in arguments
//TODO: Error if invalidate workshop ID
//TODO: Request worskhop info for embed
//TODO: Embed for accepted message
//TODO: Send embed to #playtest (or channel name in settings.js)

exports.run = (discordClient, message, args) => {
    db.get(`SELECT * FROM t_playtest WHERE id = ${args[0]};`, function(error, results) {
        if (results.status == 'pending') {
            db.run(`UPDATE t_playtest SET status = 'accepted'  WHERE id = ${args[0]};`);
            message.channel.send(`Accepted playtest: ${results.workshopid}`);
        }
    });
}
