const Discord = require('discord.js'); //Load Discord library and create a new client

const logger = require('../modules/log.js');

function newsnoo(data, datatype) {
    logger.verbose('/u/' + data.data.author + ' made a new ' + datatype + ':');
    //console.log(data.data);
    var embed = new Discord.MessageEmbed();
    if (datatype == 'comment') {
        var statusdesc = '\`\`\`' + data.data.body + '\`\`\`\n';
        embed.addField(data.data.link_title, statusdesc);
    } else if (datatype == 'post') {
        var statusdesc = '\`\`\`' + data.data.selftext + '\`\`\`\n';
        embed.addField(data.data.title, statusdesc);
    }
    //embed.setImage('https://seeklogo.com/images/R/reddit-logo-8ABF8F5F2B-seeklogo.com.png');
    embed.setTitle('NEW SNOO!')
    embed.setURL('https://www.reddit.com' + data.data.permalink);
    embed.setColor('RED');
    embed.setFooter('/u/' + data.data.author)
    discordClient.channels.find(channel => channel.id === '425737169676533760').send({
        embed
    });
}

module.exports = newsnoo;
