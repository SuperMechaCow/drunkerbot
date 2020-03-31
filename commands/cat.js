const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
    description: "Provides an image of a cat for immediate stress mitigation.", // Information about this command
    usage: settings.prefix + "cat", // How to use this command
    docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/cat.js" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
	const attachment = new Discord.MessageAttachment(__dirname + '/../data/lady_01.jpg', 'lady_01.jpg');
	const embed = new Discord.MessageEmbed()
		.setTitle('A Cat')
        .attachFiles([attachment])
		.setImage('attachment://lady_01.jpg');
	message.channel.send('',embed);
}
