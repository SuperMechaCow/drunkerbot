const Discord = require('discord.js'); //Load Discord library and create a new client
const fetch = require('node-fetch');

async function grabapi(authtype, tokin, endpoint) {
    // console.log('https://discordapp.com/api/v6' + endpoint + '\n' + authtype + ' ' + tokin);
    const response = await fetch('https://discordapp.com/api/v6' + endpoint, {
        method: 'GET',
        headers: {
            Authorization: authtype + ' ' + tokin,
        },
    });

    const userstuff = await response.json();
    return userstuff;
}

module.exports = grabapi;
