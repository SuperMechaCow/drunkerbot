const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
const rcon = require('rcon');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');
const config = require('../modules/config.js');

client = new rcon(config.GAMESERV_IP, config.GAMESERV_PORT, config.GAMESERV_RCON);

client.on('auth', function() {
    logger.verbose("Game server authorized!");
}).on('response', function(str) {
    logger.verbose("Got response from game server: " + str);

}).on('end', function() {
    logger.warn("Game server socket closed! Reconnecting...");
    client.connect();
});

client.connect();

exports.run = (discordClient, message, args) => {
    if (message.member.roles.cache.find(Role => Role.name === 'Perms')) {
        switch (args[0]) {
            case 'pre':
                client.send("exec preplaytest");
                break;
            case 'casual':
                client.send("exec casualplaytest");
                break;
            case '2v2':
                client.send("exec casual2v2playtest");
                break;
            case 'bot':
                client.send("bot_kick");
                break;
            case 'host':
                if (!args[1]) {
                    message.channel.send("You need another argument!")
                } else {
                    client.send("host_workshop_map " + args[1]);
                }
                break;
            default:
                client.send(args[0] + " " + args[1]);
                break; 
        }
    } else {
        message.channel.send("You don't have the permissions to use this command!");
    }
}
