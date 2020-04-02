const settings = require('../modules/settings.js');

exports.help = {
	description: "Rolls a d20 (picks a number between 1 and 20)", // Information about this command
	usage: settings.prefix + "roll [max]\r\n(Arguments in [] are optional)", // How to use this command
	docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/roll.js" // URL to more information about or the code for this command
}

exports.run = (client, message, args) => {
	//Try to convert the args string to an integer and see if it's a number
	let max = 20;
	if (args[0] && parseInt(args[0]) != NaN) max = args[0];
	if (Math.ceil(Math.random() * max) == 10) {
		message.channel.send(message.author.username + ' rolled a ...');
		message.channel.send('Ahh crap! I dropped the die!');
		message.channel.send('Aw man... the bastard rolled under the couch...');
	} else {
		message.channel.send(message.author.username + ' rolled a ' + Math.ceil(Math.random() * max) + ' out of ' + max + '.');
	}
}
