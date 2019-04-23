const Discord = require('discord.js'); //Load Discord library and create a new client

//Custom Modules
const logger = require('../modules/log.js');

module.exports = (discordClient, error) => {
    console.error;
    logger.error(error);
};
