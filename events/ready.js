const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

module.exports = (discordClient, message) => {

	logger.verbose(`Logged in as ${discordClient.user.tag}!`);
	discordClient.user.setPresence({
		activity: {
			name: settings.prefix + 'help',
			type: "CUSTOM_STATUS",
			url: settings.urlWEB
		},
		status: 'idle'
	})

	//Mid-event stream crash recovery
	db.get("SELECT * FROM t_events WHERE end IS NULL", function(err, results) {
		if (err) {
			logger.error(err)
		} else {
			if (results != undefined) {
				db.run("UPDATE t_events SET end = \'" + moment().unix() + "\' WHERE end IS NULL;");
				logger.warn("Old live-stream was stopped.");
			}
		}
	});

	db.get("SELECT * FROM t_botstats;", function(err, results) {
		if (err) {
			logger.error(err)
		} else {
			if (results != undefined) {
				db.run("UPDATE t_botstats SET laststart = " + moment().unix() + ", restarts = " + parseInt(results.restarts + 1) + ", appver = \'" + settings.appver + "\';");
				logger.verbose("Running appver " + settings.appver);
			} else {
				logger.error("Um... No messages table in database? Weird.")
			}
		}
	});

	const playtest_handler = require('../modules/playtest_handler.js');
	playtest_handler.setClient(discordClient);
};
