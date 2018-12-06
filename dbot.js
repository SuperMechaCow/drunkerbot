const Discord = require('discord.js');
const client = new Discord.Client();
const path = require('path');
const express = require('express');
const app = express();
const fs = require('fs');
const moment = require('moment');
//const urlExists = require('url-exists');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//SETTING UO THE DRUNKERBOX VARIABLES
var drunkerstatus = {
    "state": false,
    "host": "none",
    "hostid": "none",
    "hostpic": "none",
    "url": "none",
    "starttime": "none"
}

// DevBot
//const dbHostRoleID = '519573926586875907';
// DrunkerBot
const dbHostRoleID = '519566175299174410';

//DevBot
// READ THE TOKEN TO LOG IN
// fs.readFile('token.txt', 'utf8', function(err, data) {
//     if (err) {
//         return console.log(err);
//     }
//     client.login(data);
// })

//Drunkerbot
client.login('');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {

    const prefix = '!';

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        for (var i = 0; i < parseInt(args[0]); i++) {
            message.channel.send('Pong!');
        }
    }

    if (command === 'db') {
        switch (args[0]) {
            case 'start':
                //see if there's more arguments
                //should read YOUR discord name and have memorized your youtube link
                //the host should be put in it's own group
                if (args[1] != null) {
                    drunkerstatus.url = args[1];
                } else {
                    message.author.send("Hey! You need to set the URL for the livestream!")
                    break;
                }
                drunkerstatus.state = true;
                console.log(message.member.nickname + " started a drunkerbox");
                message.channel.send(message.author + " started a drunkerbox");
                message.member.addRole(dbHostRoleID).catch(console.error);
                drunkerstatus.host = message.member.nickname + "#" + message.author.discriminator;
                drunkerstatus.hostid = message.author.id;
                drunkerstatus.hostpic = message.author.displayAvatarURL;
                drunkerstatus.starttime = moment().unix();
                console.log(drunkerstatus);
                break;
            case 'stop':
                if (drunkerstatus.state) {
                    if (drunkerstatus.hostid == message.author.id) {
                        drunkerstatus.state = false;
                        console.log(message.member.nickname + " stopped the drunkerbox");
                        message.channel.send(message.author + " stopped the drunkerbox");
                        message.member.removeRole(dbHostRoleID).catch(console.error);
                        drunkerstatus.host = "none";
                        drunkerstatus.hostid = "none";
                        drunkerstatus.hostpic = "none";
                        drunkerstatus.url = "none";
                    } else {
                        message.channel.send("Nice try, but only the Host can stop a drunkerbox stream!")
                    }
                } else {
                    message.channel.send('No drunkerbox stream is currently started.')
                }
                break;
            case 'status':
                if (drunkerstatus.state) {
                    var statusdesc = "Host: " + drunkerstatus.host + "\n Time started: " + moment.unix(drunkerstatus.starttime).format("MMM DD, hh:mm");
                    if (drunkerstatus.url != "none")
                        statusdesc += "\n Link: " + drunkerstatus.url;
                } else {
                    var statusdesc = "No drunkerbox is currently live";
                }
                var embed = new Discord.RichEmbed()
                embed.addField("Drunkerbox Status", statusdesc)
                embed.setImage(drunkerstatus.hostpic);
                message.channel.send({
                    embed
                });
                break;
            case 'help':
                var statusdesc = "**!db start <url>**\nStart a drunkerbox stream and link tothe provided <url>\n";
                statusdesc += "**!db stop**\nStop and clear the drunkerbox\n";
                statusdesc += "**!db status**\nDisplay summary of the currently running drunkerbox stream\n";
                statusdesc += "**!db state/url/host**\nDisplay specific parameters about the current drunkerbox stream\n";
                statusdesc += "\nhttps:\/\/drunkerbot.hardwareflare.com/\nFor a human-readable drunkerbox stream status on your browser!\n";
                statusdesc += "\nFor API endpoints, send a GET request to \nhttps:\/\/drunkerbot.hardwareflare.com/api/status/\nor\nhttps:\/\/drunkerbot.hardwareflare.com/api/status/<property>";
                var embed = new Discord.RichEmbed()
                embed.addField("Drunkerbox Status", statusdesc)
                message.channel.send({
                    embed
                });
                break;
            default:
                message.channel.send("You did not enter a command that I know :\(");
                break;
        }
    }
});



app.get('/api/status', function(req, res) {
    res.send(drunkerstatus);
});

app.get('/api/status/state', function(req, res) {
    res.send(drunkerstatus.state);
});

app.get('/api/status/host', function(req, res) {
    res.send(drunkerstatus.host);
});

// on the request to root (localhost:3000/)
app.get('/', function(req, res) {
    //res.render(index)
    var sendhtml = '<center><h1>Drunkerboxes Live Status: ' + drunkerstatus.state + '</h1>';
    if (drunkerstatus.state == true) {
        sendhtml += '<br><br>Host: <img src="' + drunkerstatus.hostpic + '" height=32 width=32/>' + drunkerstatus.host + '<br><br><a href="' + drunkerstatus.url + '">Stream Link</a>';
    }
    sendhtml += '</center>'
    res.send(sendhtml);
});

// start the server in the port 3000 !
app.listen(3000, function() {
    console.log('Listening on port 3000.');
});
