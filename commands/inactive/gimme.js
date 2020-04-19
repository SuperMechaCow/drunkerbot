const Discord = require('discord.js'); //Load Discord library and create a new client
const fs = require('fs');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
	description: 'Retrieves the current live code of a command on this bot', // Information about this command
	usage: settings.prefix + 'gimme <command>', // How to use this command
	docs: 'https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/gimme.js' // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
	if (!args[0]) {
		message.channel.send("What command do you want code for?");
		discordClient.commands.get('help').run(discordClient, message, ['gimme']);
	} else {
		fs.readdir('./commands/', (err, files) => {
			if (err) return logger.error(error);
			let found = false;
			files.forEach(file => {
				if (file.split('.')[0] == args[0]) {
					found = true;
					fs.readFile('./commands/' + file, function(error, data) {
						if (error) {
							logger.error(error);
						} else {
							message.channel.send('The code for this command is:\n\`\`\`javascript\n' + data + '\n\`\`\`');
						}
					})
				};
			});
			if (!found) {
				message.channel.send("Doesn\'t look like that\'s a valid command.");
				discordClient.commands.get('help').run(discordClient, message, []);
			}
		});
	}
}
