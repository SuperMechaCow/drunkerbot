const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
const request = require('request');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

exports.help = {
    description: "This command let's you schedule a playtest", // Information about this command
    usage: settings.prefix + "schedule", // How to use this command
    docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
    //This is a command template
    if (args.length < 4){
        message.channel.send("You need to write more arguments.");
        discordClient.commands.get('help').run(discordClient, message, ['schedule']);
    } else {
        request.post({
			url: 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
			form: {
				'itemcount': '1',
				'publishedfileids[0]': args[0]
			}
		}, function(err, httpResponse, body) {
			// beginning of callback
			if (err) {
				logger.error(err);
			} else if (httpResponse.statusCode != 200) {
				if (httpResponse.statusCode == 400) {
					message.channel.send("Couldn't find that Workshop ID");
				} else {
					message.channel.send("There's a problem with the Steam Connection");
				}
			} else {
				if (!moment(args[1] + args[2], "HH:mmDD/MM/YY").isValid()) {
					message.channel.send("Invalid time/date: <HH:mm> <DD/MM/YY> (24-hour format)");
				} else {
					let utcOS = 0;
					if (moment().isDST()) {
						utcOS = -240;
					} else {
						utcOS = -300;
					}
					let time = moment(args[1] + args[2], "HH:mmDD/MM/YY").utcOffset(utcOS).unix();
					let data = JSON.parse(body).response.publishedfiledetails[0];
                    db.run(`INSERT INTO t_playtests (workshopID, time, userDID, guildDID, status, type) VALUES (\'${args[0]}\', \'${time}\', \'${message.author.id}\', \'${message.guild.id}\', \'pending\', \'${args[3]}\');`)
					let tags = '';
					data.tags.forEach((tag, index) => {
						if (index) {
							tags += ', ';
						}
						tags += tag.tag;
					});
					var embed = new Discord.MessageEmbed();
					embed.setTitle("You have scheduled:")
						.addField("Map Name:", data.title)
						.addField("Description:", data.description)
						.addField("Tags:", tags)
						.setImage(data.preview_url)
						.setURL('https://steamcommunity.com/sharedfiles/filedetails/?id=' + args[0]);
					message.channel.send('', embed);
				}
			}
		});
	}
}
