const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
	description: "This creates a Role", // Information about this command
	usage: settings.prefix + "makerole <role name>", // How to use this command
	docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/makerole.js" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
	// Create a new role with data and a reason
	message.guild.roles.create({
			data: {
				name: args.join(" "),
				color: 'BLUE',
			},
			reason: 'we needed a role for Super Cool People',
		})
		.then(console.log)
		.catch(console.error);
}
