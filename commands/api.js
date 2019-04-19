const Discord = require('discord.js'); //Load Discord library and create a new client

exports.run = (discordClient, message, args) => {
    var statusdesc = "\nhttps:\/\/drunkerbot.hardwareflare.com/\nFor a human-readable drunkerbox stream status on your browser!\n";
    statusdesc += "\nFor API endpoints, send a GET request to \nhttps:\/\/drunkerbot.hardwareflare.com/api/status/\nor\nhttps:\/\/drunkerbot.hardwareflare.com/api/status/<property>\n";
    statusdesc += "\n<property> includes:\n";
    var embed = new Discord.RichEmbed()
        .setTitle("Drunkerbox API")
        .addField("Details:", statusdesc)
        .addField("state", "Latest stream state")
        .addField("host", "Host's username#discriminator")
        .addField("userdiscordID", "Host's discord snowflake")
        .addField("userAvatar", "Host's avatar URL")
        .addField("url", "URL of livestream")
        .addField("startime", "Unix time the stream started")
        .addField("end", "Unix time the stream ended")
    message.channel.send({
        embed
    });
}
