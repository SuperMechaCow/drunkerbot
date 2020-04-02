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
				.addField("Specific Usage:", "*" + settings.prefix + "help <command>*")
			message.channel.send({
				embed
			});
		});
	}
}
