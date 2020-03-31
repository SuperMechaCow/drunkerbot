const settings = require('../modules/settings.js');

exports.help = {
    description: "Poke the bot to make sure it's awake. It should 'Pong' back. That's it. This help data object is bigger than the whole command", // Information about this command
    usage: settings.prefix + "ping", // How to use this command
    docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/ping.js" // URL to more information about or the code for this command
}

exports.run = (client, message, args) => {
    message.channel.send('Pong!')//.catch(logger.error(error));
}
