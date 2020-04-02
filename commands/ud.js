const Discord = require('discord.js'); //Load Discord library and create a new client
const ud = require('urban-dictionary'); //Handling datestamps and time formats

//Custom Modules
const settings = require('../modules/settings.js');

exports.help = {
    description: "Looks up a word on Urban Dictionary", // Information about this command
    usage: settings.prefix + "ud \"word to look up\" \r\n(The word you are looking up must be in double-quotes)", // How to use this command
    docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/ud.js" // URL to more information about or the code for this command
}

exports.run = (discordClient, message, args) => {
    var desc = message.content.split(/\"+/g);
    //Go through all results and remove empty spaces
    desc.forEach(function(item, index) {
        if (desc[index] == " ")
            desc.splice(index, 1)
    });

    if (desc[1]) {
        ud.term(desc[1], (error, entries, tags, sounds) => {
            if (entries != undefined) {
                const embed = new Discord.MessageEmbed()
                    .setTitle("Urban Dictionary Top Result")
                    .setColor('GOLD')
                    .addField(entries[0].word, entries[0].definition + "\n*" + entries[0].example + "*");
                message.channel.send({
                    embed
                });
            } else {
                message.channel.send("I couldn\'t find that word/phrase.");
            }
        });
    } else {
        var embed = new Discord.MessageEmbed()
        embed.setTitle(args[0])
            .addField("OOPS!", 'I need a word/phrase in double quotes to look up!')
            .addField("Usage", discordClient.commands.get('help').usage)
            .setURL(discordClient.commands.get('help').docs);
        message.channel.send('', embed);
    }
}
