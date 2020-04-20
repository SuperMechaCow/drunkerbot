const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
const request = require('request');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');
const config = require('../modules/config.js');

let discordClient = {}

function checkTimes() {
	db.all(`SELECT * FROM t_playtests WHERE status = 'accepted';`, function(error, results) {
		if (results != undefined) {
		results.forEach(function(result, index) {
			//Check each result
			if (moment.unix(result.time).isSameOrBefore(moment())) {
				//If this result's time is BEFORE the current time (the timer has passed)
				db.get(`SELECT * FROM t_playtests WHERE status = 'active';`, function(getError, getResults) {
					if (getError) {
						logger.error(getError);
					} else if (getResults != undefined) {
						db.run(`UPDATE t_playtests SET status = 'canceled' WHERE id = ${result.id};`, function(runError) {
							if (runError) logger.error(runError);
						});
						//Send error
					} else {
						db.run(`UPDATE t_playtests SET status = 'active' WHERE id = ${result.id};`, function(runError) {
							if (runError) {
								logger.error(runError)
							} else {
								startPlaytest(result);
							}
						});
					}
				});
			}
		})
	}
	});
}

function startPlaytest(mapTest) {
	request.post({
		url: 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
		form: {
			'itemcount': '1',
			'publishedfileids[0]': mapTest.workshopID
		}
	}, function(err, httpResponse, body) {
		// beginning of callback
		if (err) {
			logger.error(err);
		} else if (httpResponse.statusCode != 200) {
			if (httpResponse.statusCode == 400) {
				logger.error("I couldn't find that Workshop ID");
			} else {
				logger.error("There's a problem with the Steam Connection");
			}
		} else {
			logger.verbose("Playtest live");
            let utcOS = 0;
            if (moment().isDST()) {
                utcOS = -240;
            } else {
                utcOS = -300;
            }
            let time = moment(mapTest.time).utcOffset(utcOS).format("HH:mm DD/MM/YY");
            let data = JSON.parse(body).response.publishedfiledetails[0];
            let playtestRole = discordClient.guilds.cache.get(mapTest.guildDID).roles.cache.find(role => role.name === 'Playtester');
            var embed = new Discord.MessageEmbed();
            embed.setTitle("Playtest is live:")
                .addField("Map Name:", data.title)
                .addField("Playtest Started:", time)
                .addField("Description:", data.description)
                .addField("Gamemode being tested:", mapTest.type)
                .setImage(data.preview_url)
                .setColor('RED')
                .setURL(`${settings.urlWEB}steamgame?ip=${config.GAMESERV_IP}&port=${config.GAMESERV_PORT}`);
            //.setURL(`steam://connect/${config.GAMESERV_IP}:${config.GAMESERV_PORT}`); //This doesn't work >:[
            let mapChannel = discordClient.guilds.cache.get(mapTest.guildDID).channels.cache.find(channel => channel.name === 'playtest');
            mapChannel.send(playtestRole, embed);
		}
	});
}

setInterval(checkTimes, 1000);

exports.setClient = function(dClient) {
	discordClient = dClient;
}
