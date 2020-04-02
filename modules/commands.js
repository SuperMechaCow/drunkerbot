const Discord = require('discord.js'); //Load Discord library and create a new client
const fs = require('fs');

//Custom Modules
const logger = require('../modules/log.js');

exports.load = function(discordClient) {
    fs.readdir("./commands/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            // Load the command file itself
            let props = require(`../commands/${file}`);
            // Get just the command name from the file name
            let commandName = file.split(".")[0];
            //logger.verbose(`Attempting to load command ${commandName}`);
            // Here we simply store the whole thing in an Enmap. We're not running it right now.
            discordClient.commands.set(commandName, props);
        });
    });
}
