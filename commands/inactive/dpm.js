const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
const fs = require('fs');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');
const commands = require('../modules/commands.js');


exports.help = {
	description: "Drunk Package Manager. Used to load and unload commands.", // Information about this command
	usage: settings.prefix + "dpm <options> <command>\nOptions:\n i - enable command\n u - disable command\n(Arguments in <> are required)", // How to use this command
	docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/dpm" // URL to more information about or the code for this command
}


// Thanks, stackexchange!
// https://stackoverflow.com/questions/8579055/how-do-i-move-files-in-node-js

function move(oldPath, newPath, callback) {

	fs.rename(oldPath, newPath, function(err) {
		if (err) {
			if (err.code === 'EXDEV') {
				copy();
			} else {
				callback(err);
			}
			return;
		}
		callback();
	});

	function copy() {
		var readStream = fs.createReadStream(oldPath);
		var writeStream = fs.createWriteStream(newPath);

		readStream.on('error', callback);
		writeStream.on('error', callback);

		readStream.on('close', function() {
			fs.unlink(oldPath, callback);
		});

		readStream.pipe(writeStream);
	}
}

exports.run = (discordClient, message, args) => {
	// There must be at least two arugments to manipulate a file
	if (args.length != 2) {
		message.channel.send("You need more arguments to use this")
		const cmd = discordClient.commands.get('help');
		cmd.run(discordClient, message, 'dpm');
	} else {
		switch (args[0]) {
			case 'i':
				//move from inactive to active and reload
				break;
			case 'u':
				fs.readdir("./commands", (err, files) => {
					if (err) return console.error(err);
					let found = false;
					files.forEach(file => {
                        console.log("Checking " + file.split(".")[0] + " against " + args[1]);
						if (file.split(".")[0] == args[1]) {
							found = true;
							move('./commands' + file, './commands/inactive/' + file, function() {
								console.log("I did it daddy!");
							});
						}
					});
				});
				//move from inactive to active and reload
				break;
			default:
				message.channel.send("You need more arguments to use this")
				const cmd = discordClient.commands.get('help');
				cmd.run(discordClient, message, 'dpm');
				break;
		}
	}
}
