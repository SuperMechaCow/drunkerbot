const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
const Enmap = require('Enmap');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');
const commands = require('../modules/commands.js');

exports.help = {
    description: "Allows you to rescan the commands folder without restarting the bot.", // Information about this command
    usage: settings.prefix + "reload", // How to use this command
    docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/reload" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
    try {
        discordClient.commands = new Enmap();
        commands.load(discordClient);
        message.channel.send("Reloaded commands.")
    } catch (e) {
        logger.error(e)
    }
}
