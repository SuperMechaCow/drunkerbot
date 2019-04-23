const Discord = require('discord.js'); //Load Discord library and create a new client
const fs = require('fs');

exports.run = (client, message, args) => {
    switch (args[0]) {
        case 'ping':
            message.channel.send("**!#ping\n** Ping the bot");
            break;
        case 'roll':
            message.channel.send("**!#roll\n** Random number between 1 and 20");
            break;
        case 'start':
            message.channel.send("**!#start <url>\n** Start a drunkerbox stream and link to the provided <url>");
            break;
        case 'stop':
            message.channel.send("**!#stop\n** Stop and clear the drunkerbox");
            break;
        case 'status':
            message.channel.send("**!#status\n** Display summary of the currently running drunkerbox stream");
            break;
        case 'dbase':
            message.channel.send("**!#dbase\n** Display stats about the DrunkerBoxes database");
            break;
        case 'about':
            message.channel.send("**!#about\n** Display stats about drunkerbot");
            break;
        case 'git':
            message.channel.send("**!#git\n** Links to Drunkerboxes related Git Repos");
            break;
        case 'alerts':
            message.channel.send("**!#alerts\n** Toggle alerts for DrunkerBoxes for yourself");
            break;
        case 'api':
            message.channel.send("**!#api\n** Drunkerbot API information");
            break;
        case 'karma':
            message.channel.send("**!#karma\n** Check your or <mention>\'s Karma breakdown");
            break;
        case 'whois':
            message.channel.send("**!#whois <mention>\n** Check your or <mention>\'s Player Card\'");
            break;
        case 'top10':
            message.channel.send("**!#top10\n** Top 10 in messages sent in the current channel");
            break;
        case 'sell':
            message.channel.send("**!#sell <quantity> <USD price> \"<Name>\" \"<Description>\"\n** Sell a thing! *(must use double quotes!)*");
            break;
        case 'buy':
            message.channel.send("**!#buy <item ID> <quantity>\n** Send a purchase order to the seller.");
            break;
        case 'catalogue':
            message.channel.send("**!#catalogue\n** List what's for sale and find the item IDs");
            break;
        case 'status':
            message.channel.send("**!#status <item ID> <available/unavailable>\n** Change the status of an item you are selling.");
            break;
        default:
            var statusdesc = "";
            fs.readdir("./commands/", (err, files) => {
                if (err) return logger.error(err);
                files.forEach(function(file, index) {
                    if (!file.endsWith(".js")) return;
                    // Get just the command name from the file name
                    let commandName = file.split(".")[0];
                    statusdesc += commandName;
                    if (index + 1 != files.length)
                        statusdesc += ", ";
                });
                var embed = new Discord.RichEmbed()
                    .setTitle("Drunkerbot Help")
                    .addField("Available Commands:", statusdesc)
                    .addField("Specific Usage:", "*!#help <command>*")
                message.channel.send({
                    embed
                });
            });
            break;
    }
}
