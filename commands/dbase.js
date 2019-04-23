const Discord = require('discord.js'); //Load Discord library and create a new client
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');

exports.run = (discordClient, message, args) => {
    db.all("SELECT * FROM t_users;", function(err, results) {
        if (results !== "") {
            var statusdesc = "Registered users: " + results.length + "\n";
            var ttlcount = 0;
            var alertcount = 0;
            var udccount = 0;
            var ddccount = 0;
            results.forEach(function(item, index) {
                alertcount += results[index].alerts;
                ttlcount += results[index].message_count;
                udccount += results[index].updoots;
                ddccount += results[index].downdoots;
            });
            statusdesc += "Alerts set: " + alertcount + "\n";
            statusdesc += "Messages sent: " + ttlcount + "\n";
            statusdesc += "Updoots: " + udccount + "\n";
            statusdesc += "Downdoots: " + ddccount + "\n";
            var embed = new Discord.RichEmbed()
            embed.addField("Drunkerbox Database Stats", statusdesc);
            message.channel.send({
                embed
            });
        } else {
            //Handle the empty database here
        }
    });
}
