const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
	description: "Shows you the current time by the bot\'s server clock.", // Information about this command
	usage: settings.prefix + "time", // How to use this command
	docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/time" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
	let utcOS = 0;
	if (moment().isDST()) {
		utcOS = -240;
	} else {
		utcOS = -300;
	}
	let time = moment().utcOffset(utcOS).format("HH:mm:ss, DD/MM/YY");
	message.channel.send(`According to extraordinary sense of time (and my server box clock), it is ${time}.`);
	logger.verbose("Time Check! " + moment().unix());
}
