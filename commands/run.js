const Discord = require('discord.js'); //Load Discord library and create a new client
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const newuser = require('../modules/newuser.js');

exports.run = (discordClient, message, args) => {
    // THIS ISN'T ZOMBIE CODE!
    // This code is very functional, but allows users to run totally arbitrary code from the discord channel
    // Consider the commenting out this code as the "Safety On"

    if (message.member.permissions.has('ADMINISTRATOR')) {

        var commandstore = message.content;

        var myRegexp = /```([^```]*)```/g;
        var arr = [];

        //Iterate through results of regex search
        do {
            var match = myRegexp.exec(commandstore);
            if (match != null) {
                //Each call to exec returns the next match as an array where index 1
                //is the captured group if it exists and index 0 is the text matched
                arr.push(match[1] ? match[1] : match[0]);
            }
        } while (match != null);

        //console.log(arr.toString());
        eval(arr.toString());
    } else {
        message.channel.send("This command can only be used by Administrators on this server. It really shouldn't be used by anybody ever. It shouldn't exist. This is irresponsible.")
    }
}
