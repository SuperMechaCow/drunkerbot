const Discord = require('discord.js'); //Load Discord library and create a new client
const fs = require('fs');
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

const {
    createCanvas,
    loadImage
} = require('canvas');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    db.all("SELECT * FROM t_messages WHERE channelDID = \'" + message.channel.id + "\' AND guildDID = \'" + message.guild.id + "\' ORDER BY message_count DESC LIMIT 10;", function(err, results) {
        if (err) {
            logger.error(err);
        } else {
            if (results !== "") {
                //Bar Width / Height
                const bW = 250;
                const bH = 24
                //Bar position
                const bX = 10;
                const bY = 51;
                //Bar Margin
                const bM = 2;
                //Canvas Width  / Height
                const canW = bW;
                const canH = results.length * (bH + bM);
                //Text location inside of bar
                const textOffsetX = 12
                const textOffsetY = 17

                const canvas = createCanvas(canW, canH)
                const ctx = canvas.getContext('2d')

                loadImage(__dirname + '/../data/nameBar.png').then((nameBar) => {
                    results.forEach(function(item, index) {
                        //Draw the playercard background
                        ctx.drawImage(nameBar, 0, index * (bH + bM), bW, bH);
                        // Start drawing text
                        ctx.textAlign = 'left'
                        ctx.font = '16px Courier'
                        ctx.fillStyle = 'rgba(255,255,255,1)';
                        ctx.fillText(discordClient.users.find(user => user.id === item.userDID).username, textOffsetX, textOffsetY + (index * (bH + bM))); // User name
                        ctx.textAlign = 'right'
                        ctx.fillText(item.message_count + '💬', canW - textOffsetX, textOffsetY + (index * (bH + bM))); // User name
                    });
                    const out = fs.createWriteStream(__dirname + '/../data/tempTop10.png');
                    const stream = canvas.createPNGStream();
                    stream.pipe(out);
                    out.on('finish', () => {
                        const attachment = new Discord.Attachment(__dirname + '/../data/tempTop10.png', 'tempTop10.png');
                        const embed = new Discord.RichEmbed()
                            .setTitle("#" + discordClient.channels.find(channel => channel.id === message.channel.id).name.toUpperCase() + " Top 10")
                            .attachFile(attachment)
                            .setImage('attachment://tempTop10.png')
                        //.addField("Joined on: ", moment.unix(whoismember.joinedTimestamp).format('MM/DD/YY'));
                        message.channel.send({
                            embed
                        });
                    });
                });
            }
        }
    });
}
