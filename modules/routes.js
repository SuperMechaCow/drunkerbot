const Discord = require('discord.js'); //Load Discord library and create a new client
const fs = require('fs');

//Custom Modules
const logger = require('../modules/log.js');

exports.load = function(discordClient) {
    fs.readdir("./routes/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            // Load the route file itself
            let props = require(`../routes/${file}`);
            // Get just the route name from the file name
            let routeName = file.split(".")[0];
            //logger.verbose(`Attempting to load route ${routeName}`);
            // Here we simply store the whole thing in an Enmap. We're not running it right now.
            discordClient.routes.set(routeName, props);
        });
    });
}
