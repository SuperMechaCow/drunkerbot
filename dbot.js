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
app.use(express.static("public"));

//Iterate this each time you update the bot
const appver = "0006";

const PORT = "3000";

//DevBot
// const dbHostRoleID = '519573926586875907';
// const dbTokenFile = 'token_devbot.txt';

// DrunkerBot
const dbHostRoleID = '519566175299174410';
const dbTokenFile = 'token_drubot.txt';

//SETTING UP THE DRUNKERBOX VARIABLES
var drunkerstatus = {
    "state": false,
    "host": "none",
    "hostid": "none",
    "hostpic": "none",
    "url": "none",
    "starttime": "none"
}

// Login from token file
fs.readFile(dbTokenFile, 'utf8', function(err, data) {
    if (err) {
        return console.log(err);
    }
    client.login(data);
})

// Direct Login
//client.login('YOUR TOKEN HERE');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {

    const prefix = '!';

    //This code isn't looking for a prefix. It's just removing the first letter
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
                if (drunkerstatus.state != "false") {
                    if (args[1] != null) {
                        drunkerstatus.url = args[1];
                    } else {
                        message.author.send("Hey! You need to set the URL for the livestream!")
                        break;
                    }
                    drunkerstatus.state = true;
                    // I commented out nicknames until I can figure out how to stop it from returning "null"
                    // console.log(message.member.nickname + " started a drunkerbox");
                    console.log(message.author.username + " started a drunkerbox");
                    message.channel.send(message.author + " started a drunkerbox");
                    message.member.addRole(dbHostRoleID).catch(console.error);
                    // drunkerstatus.host = message.member.nickname + "#" + message.author.discriminator;
                    drunkerstatus.host = message.author.username + "#" + message.author.discriminator;
                    drunkerstatus.hostid = message.author.id;
                    drunkerstatus.hostpic = message.author.displayAvatarURL;
                    drunkerstatus.starttime = moment().unix();
                    console.log(drunkerstatus);
                } else {
                    message.channel.send(drunkerstatus.host + " has already started a drunkerbox stream. Please have them stop their stream first!");
                }
                break;
            case 'stop':
                if (drunkerstatus.state) {
                    if (drunkerstatus.hostid == message.author.id) {
                        drunkerstatus.state = false;
                        // console.log(message.member.nickname + " stopped the drunkerbox");
                        console.log(message.author.username + " stopped the drunkerbox");
                        message.channel.send(message.author + " stopped the drunkerbox");
                        message.member.removeRole(dbHostRoleID).catch(console.error);
                        drunkerstatus.host = "none";
                        drunkerstatus.hostid = "none";
                        drunkerstatus.hostpic = "none";
                        drunkerstatus.url = "none";
                        drunkerstatus.starttime = "none";
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
            case 'git':
                var statusdesc = "You can find my code at:\nhttps://github.com/HardWareFlare/drunkerbot\n\nYou can find the drunkertracker code at:\nhttps://github.com/IntPirate/DrunkerBoxes";
                var embed = new Discord.RichEmbed()
                embed.addField("Drunkerbox Git Repo", statusdesc)
                message.channel.send({
                    embed
                });
                break;
            case 'help':
                var statusdesc = "**!db start <url>**\nStart a drunkerbox stream and link tothe provided <url>\n";
                statusdesc += "**!db stop**\nStop and clear the drunkerbox\n";
                statusdesc += "**!db status**\nDisplay summary of the currently running drunkerbox stream\n";
                statusdesc += "**!db git**\nLinks to Drunkerboxes related Git Repos\n";
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

app.get('/api/status/hostid', function(req, res) {
    res.send(drunkerstatus.hostid);
});

app.get('/api/status/hostpic', function(req, res) {
    res.send(drunkerstatus.hostpic);
});

app.get('/api/status/url', function(req, res) {
    res.send(drunkerstatus.url);
});

app.get('/api/status/starttime', function(req, res) {
    res.send(drunkerstatus.starttime);
});

// on the request to root (localhost:3000/)
app.get('/', function(req, res) {
    res.render('index', {
        drunkerstatus: drunkerstatus
    });
});

// start the server in the port 3000 !
app.listen(PORT, function() {
    console.log('Listening on port ' + PORT + '.');
});
