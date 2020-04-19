const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const request = require('request');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
	description: "Lookup a map by its workshop ID.", // Information about this command
	usage: settings.prefix + "workshop <workshop ID>", // How to use this command
	docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/pt_lookup" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
	if (!args[0]) {
		message.channel.send("Workshop ID required.");
		discordClient.commands.get('help').run(discordClient, message, ['workshop']);
	} else {
		request.post({
			url: 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
			form: {
				'itemcount': '1',
				'publishedfileids[0]': args[0]
			}
		}, function(err, httpResponse, body) {
			if (err) {
				logger.error(err);
			} else if (httpResponse.statusCode != 200) {
				if (httpResponse.statusCode == 400) {
					message.channel.send("I couldn't find that Workshop ID");
				} else {
					message.channel.send("There's a problem with the Steam Connection");
				}
			} else {
				let data = JSON.parse(body).response.publishedfiledetails[0];
				let tags = '';
				data.tags.forEach((tag, index) => {
					if (index) {
						tags += ', ';
					}
					tags += tag.tag;
				});
				var embed = new Discord.MessageEmbed()
				embed.setTitle(data.title)
					.addField("Description:", data.description)
					.addField("Tags:", tags)
					.setImage(data.preview_url)
					.setURL('https://steamcommunity.com/sharedfiles/filedetails/?id=' + args[0]);
				message.channel.send('', embed);
			}
		});
	}
}
