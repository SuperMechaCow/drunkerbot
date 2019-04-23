const Discord = require('discord.js'); //Load Discord library and create a new client

const settings = require('../modules/settings.js');
const doot = require('../modules/doot.js');

module.exports = (discordClient, reaction, user) => {

    if (reaction.message.author.bot) return;

    if (reaction.message.author != reaction.users.last()) {
        doot(reaction.message.author, reaction.emoji.name, settings.DOOTEE_BONUS);
        doot(user, reaction.emoji.name, settings.DOOTER_BONUS);
    }

};
