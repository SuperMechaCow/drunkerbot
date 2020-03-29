const Discord = require('discord.js'); //Load Discord library and create a new client
const ud = require('urban-dictionary'); //Handling datestamps and time formats

//Custom Modules


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
                const embed = new Discord.RichEmbed()
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
        message.channel.send('I need a word/phrase in double quotes to look up!\n\n!#ud \"word\"')
    }
}
