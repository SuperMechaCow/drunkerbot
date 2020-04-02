const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
const fs = require('fs');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
	description: "Provides an image of a cat for immediate stress mitigation.", // Information about this command
	usage: settings.prefix + "cat", // How to use this command
	docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/cat.js" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
	fs.readdir(__dirname + '/../data/cats/', function(error, catFiles) {
		// the folder is __dirname + '/../data/cats/'
		// each cat image must start with 'cat'
		// they are enumerated by number
		// must be .jpg
		// example is 'cat1.jpg'
		let validCatFiles = []
		for (let i = 0; i < catFiles.length; i++) {
			if (catFiles[i].toLowerCase().split(".")[1] == "jpg") {
				validCatFiles.push(catFiles[i]);
			}
		}
		const attachment = new Discord.MessageAttachment(__dirname + '/../data/cats/' + validCatFiles[Math.floor(Math.random() * validCatFiles.length)], 'cat.jpg');
		const embed = new Discord.MessageEmbed()
			.setTitle('A Cat')
			.attachFiles([attachment])
			.setImage('attachment://cat.jpg');
		message.channel.send('', embed);
	});
}
