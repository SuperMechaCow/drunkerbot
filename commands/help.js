const Discord = require('discord.js'); //Load Discord library and create a new client
const fs = require('fs');

const settings = require('../modules/settings.js');

exports.help = {
    description: "It, uh... shows this dialogue. You're already using it correctly.", // Information about this command
    usage: settings.prefix + "help [command to get help with]\r\n(Arguments in [] are optional)", // How to use this command
    docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/help.js" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
	if (args[0]) {
		// Grab the command data from the discordClient.commands Enmap
		const cmd = discordClient.commands.get(args[0]);
		// If that command doesn't exist, tell the username
		if (!cmd) {
			message.channel.send("I don't recognize that command, so I can\'t help you.");
		} else if (!cmd.help) {
			message.channel.send("I found that command, but it doesn't have help data.");
		} else {
			var embed = new Discord.MessageEmbed()
			embed.setTitle(args[0])
				.addField("Description", cmd.help.description)
				.addField("Usage", cmd.help.usage)
				.setURL(cmd.help.docs);
			message.channel.send('', embed);
		}
	} else {
		//**!#ping\n** Ping the bot
		//**!#roll\n** Random number between 1 and 20
		//**!#start <url>\n** Start an event stream and link to the provided <url>
		//**!#stop\n** Stop and clear the event
		//**!#status\n** Display summary of the currently running event stream
		//**!#dbase\n** Display stats about the DrunkerBoxes database
		//**!#about\n** Display stats about drunkerbot
		//**!#git\n** Links to Eventes related Git Repos
		//**!#alerts\n** Toggle alerts for DrunkerBoxes for yourself
		//**!#api\n** Drunkerbot API information
		//**!#karma\n** Check your or <mention>\'s Karma breakdown
		//**!#whois <mention>\n** Check your or <mention>\'s Player Card\'
		//**!#top10\n** Top 10 in messages sent in the current channel
		//**!#sell <quantity> <USD price> \"<Name>\" \"<Description>\"\n** Sell a thing! *(must use double quotes!)*
		//**!#buy <item ID> <quantity>\n** Send a purchase order to the seller.
		//**!#catalogue\n** List what's for sale and find the item IDs
		//**!#status <item ID> <available/unavailable>\n** Change the status of an item you are selling.
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
			var embed = new Discord.MessageEmbed()
				.setTitle("Drunkerbot Help")
				.addField("Available Commands:", statusdesc)
				.addField("Specific Usage:", "*!#help <command>*")
			message.channel.send({
				embed
			});
		});
	}
}
