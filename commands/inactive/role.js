const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
	description: "", // Information about this command
	usage: settings.prefix + "", // How to use this command
	docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
	try {
		//Check to see if the user who used the command has the permission to change roles
        //If not, end the function by returning a message
		if (!message.member.hasPermission("MANAGE_MEMBERS")) return message.reply("sorry pal, you can't do that.");
        //Find the targetted user
		let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0])
        //If we couldn't find that user, return with a message
		if (!rMember) return message.reply("Couldn't find that users, yo.")
        //Glue the remaing arguments back together to create a complete roll name
		let role = args.join(" ").slice(22);
        //If they didn't provide any extra arguments, return with a message
		if (!role) return message.reply("Specify a role!");
        // find the role to add the targetted user to
		let gRole = message.guild.roles.cache.find(Role => Role.name === role)
        // If we couldn't find that role, return with a MessageEmbed
		if (!gRole) return message.reply("Conldn't find that role.");
        // If the targetted user already has that roll
		if (rMember.roles.cache.find(Role => Role.name === gRole.name)) {
            // return with a message
            return message.reply("They are already in that role")
        } else {
            // otherwise, add the targetted user to the role
            rMember.roles.add(gRole);
            message.channel.send(`Congrats, you have been given the role: ${gRole.name}`)
        }
	} catch (e) {
		console.error(e);
	}
	// message.channel.send('uno reverse card')
}
