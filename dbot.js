//Load Discord library and create a new client
const Discord = require('discord.js');
const client = new Discord.Client();
//Express framework
const express = require('express');
const app = express();
//Express directory handling
const path = require('path');
//Interacting with filesystem
const fs = require('fs');
//Handling datestamps and time formats
const moment = require('moment');
//Parses data from http request bodies
const bodyParser = require('body-parser');
//Interfaces with sqlite3 database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/dbdbase.db');
//Validates URLs
//const urlExists = require('url-exists');
//For detailed logging
const {
    createLogger,
    format,
    transports
} = require('winston');

//Set up the logger
const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [new transports.Console()]
});

//Set up express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static("public"));

//Iterate this each time you update the bot
const appver = "0017";

const PORT = "3000";

const dbTokenFile = 'config.json';

const dootee_bonus = 100;
const dooter_bonus = 25;

const defaultResults = {
    "state": false,
    "host": "none",
    "hostid": "none",
    "hostpic": "none",
    "url": "none",
    "starttime": "none",
    "stoptime": "none"
}

var config = null;

// Login from token file
// This needs to be changed to a envvar or db entry
fs.readFile(dbTokenFile, 'utf8', function(err, data) {
    if (err) {
        return logger.error(err);
    }
    config = JSON.parse(data);
    client.login(config.token);
})

client.on('ready', () => {
    logger.verbose(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('idle');
});

// start the server in the port 3000 !
app.listen(PORT, function() {
    logger.verbose('Listening on port ' + PORT + '.');
    //Mid-drunkerbox stream crash recovery
    db.get("SELECT * FROM dboxes WHERE state = 1;", function(err, results) {
        if (results != undefined) {
            db.run("UPDATE dboxes SET stoptime = " + moment().unix() + ", state = 0 WHERE state = 1;");
            logger.warn("Old live-stream was stopped.");
        }
    });
    db.get("SELECT * FROM dbotstats;", function(err, results) {
        if (results != undefined) {
            db.run("UPDATE dbotstats SET laststart = " + moment().unix() + ", restarts = " + parseInt(results.restarts + 1) + ", appver = " + appver + ";");
            logger.verbose("Running appver " + appver);
        } else {
            logger.error("Um... No dbotstat table in database? Weird.")
        }
    });
});

//Call this to create a new user in the database
function db_newuser(newuserauthor, newusermember) {
    db.run("INSERT INTO fans (fanname, alerts, msgcount, updootcount, downdootcount, updooty, downdooty) VALUES (\'" + newuserauthor.username + "#" + newuserauthor.discriminator + "\', 0, 1, 0, 0, 0, 0);");
    logger.verbose("Created a new profile for: " + newuserauthor.username + "\n");
    // Let the user know if it succeeded
    //newusermember.addRole(config.dbAlertsRoleID).catch(console.error);
    newuserauthor.send("Hi! I created a new profile for you!\n\nYour alerts are set to false.\nUse \"!db alerts\" to sign up for alerts.");
}

/*
 ██████  █████  ██      ██           ██████  ███████     ██████   ██████   ██████  ████████ ██    ██
██      ██   ██ ██      ██          ██    ██ ██          ██   ██ ██    ██ ██    ██    ██     ██  ██
██      ███████ ██      ██          ██    ██ █████       ██   ██ ██    ██ ██    ██    ██      ████
██      ██   ██ ██      ██          ██    ██ ██          ██   ██ ██    ██ ██    ██    ██       ██
 ██████ ██   ██ ███████ ███████      ██████  ██          ██████   ██████   ██████     ██       ██
*/

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.author != reaction.users.last()) {
        doot(reaction.message.author, reaction.emoji.name, dootee_bonus);
        doot(user, reaction.emoji.name, dooter_bonus);
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.message.author != reaction.users.last()) {
        doot(reaction.message.author, reaction.emoji.name, dootee_bonus * -1);
        doot(user, reaction.emoji.name, dooter_bonus * -1);
    }
});

client.on('messageReactionRemoveAll', (reaction, user) => {
    //Learn how this works
});

function doot(dootUser, dootemoji, adjust) {
    //This is sloppy code, I know.
    if (dootemoji === "upvote" || dootemoji === "downvote") {
        //Find user in database (create new function that does this)
        db.all("SELECT * FROM fans WHERE fanname = \'" + dootUser.username + "#" + dootUser.discriminator + "\';", function(err, results) {
            if (results == "") {
                logger.warn("Couldn't find that user: " + dootUser.username + "#" + dootUser.discriminator);
                db_newuser(message.author, message.member);
            }
            //save to db
            if (dootemoji === "upvote") {
                db.run("UPDATE fans SET updootcount = " + (results[0].updootcount + adjust) + " WHERE fanname = \'" + dootUser.username + "#" + dootUser.discriminator + "\';");
            }
            if (dootemoji === "downvote") {
                db.run("UPDATE fans SET downdootcount = " + (results[0].downdootcount + adjust) + " WHERE fanname = \'" + dootUser.username + "#" + dootUser.discriminator + "\';");
            }
        });
    }
}

/*
██████  ██ ███████  ██████  ██████  ██████  ██████      ███    ███ ███████ ███████ ███████  █████   ██████  ███████ ███████
██   ██ ██ ██      ██      ██    ██ ██   ██ ██   ██     ████  ████ ██      ██      ██      ██   ██ ██       ██      ██
██   ██ ██ ███████ ██      ██    ██ ██████  ██   ██     ██ ████ ██ █████   ███████ ███████ ███████ ██   ███ █████   ███████
██   ██ ██      ██ ██      ██    ██ ██   ██ ██   ██     ██  ██  ██ ██           ██      ██ ██   ██ ██    ██ ██           ██
██████  ██ ███████  ██████  ██████  ██   ██ ██████      ██      ██ ███████ ███████ ███████ ██   ██  ██████  ███████ ███████
*/

client.on('message', message => {

    logger.debug(message.author.id);

    /*
    ███    ███ ███████ ███████ ███████  █████   ██████  ███████      ██████  ██████  ██    ██ ███    ██ ████████ ███████ ██████
    ████  ████ ██      ██      ██      ██   ██ ██       ██          ██      ██    ██ ██    ██ ████   ██    ██    ██      ██   ██
    ██ ████ ██ █████   ███████ ███████ ███████ ██   ███ █████       ██      ██    ██ ██    ██ ██ ██  ██    ██    █████   ██████
    ██  ██  ██ ██           ██      ██ ██   ██ ██    ██ ██          ██      ██    ██ ██    ██ ██  ██ ██    ██    ██      ██   ██
    ██      ██ ███████ ███████ ███████ ██   ██  ██████  ███████      ██████  ██████   ██████  ██   ████    ██    ███████ ██   ██
    */

    //USERS SHOULD BE ABLE TO OPT OUT OF THIS AND ALL TRACKING
    db.all("SELECT * FROM fans WHERE fanname = \'" + message.author.username + "#" + message.author.discriminator + "\';", function(err, results) {
        if (results == "") {
            logger.warn("Couldn't find that user");
            db_newuser(message.author, message.member);
        } else {
            //KEEP THIS LINE OF CODE IN UNTIL EVERYONE'S PROFILE IS POPULATED WITH ID'S
            if (results.id == undefined) {
                db.run("UPDATE fans SET id = " + message.author.id + " WHERE fanname = \'" + message.author.username + "#" + message.author.discriminator + "\';");
            }
            db.run("UPDATE fans SET msgcount = " + (results[0].msgcount + 1) + " WHERE fanname = \'" + message.author.username + "#" + message.author.discriminator + "\';");
        }
    });

    /*
    ██████  ██████       ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████  ███████
    ██   ██ ██   ██     ██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██ ██
    ██   ██ ██████      ██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██ ███████
    ██   ██ ██   ██     ██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██      ██
    ██████  ██████       ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████  ███████
    */

    const prefix = '!';

    //This code isn't looking for a prefix. It's just removing the first letter
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        message.channel.send('Pong!');
    }

    if (command === 'roll') {
        message.channel.send(message.author.username + ' rolled a ' + (Math.round(Math.random() * (20 - 1) + 1)) + ' out of 20.');
    }

    if (command === 'db') {
        switch (args[0]) {

            case 'ping':
                message.channel.send('Use \"!ping\". This isn\'t really a command, though you keep trying to make it one.');
                break;

                /*
                ████████ ███████ ███████ ████████
                   ██    ██      ██         ██
                   ██    █████   ███████    ██
                   ██    ██           ██    ██
                   ██    ███████ ███████    ██
                */

            case 'test':

                break;

                /*
                ███████ ████████  █████  ██████  ████████
                ██         ██    ██   ██ ██   ██    ██
                ███████    ██    ███████ ██████     ██
                     ██    ██    ██   ██ ██   ██    ██
                ███████    ██    ██   ██ ██   ██    ██
                */

            case 'start':

                db.get("SELECT * FROM dboxes WHERE state = 1;", function(err, results) {
                    if (results == undefined) {
                        if (args[1] != null) {
                            //Validate the the URL here
                            db.run("INSERT INTO dboxes (state, hostname, hostid, hostpic, url, starttime) VALUES (1, \'" + message.author.username + "#" + message.author.discriminator + "\', \'" + message.author.id + "\', \'" + message.author.displayAvatarURL + "\', \'" + args[1] + "\', " + moment().unix() + ");");
                            logger.verbose(message.author.username + "#" + message.author.discriminator + " started a drunkerbox");
                            message.member.addRole(config.dbHostRoleID);
                            var embed = new Discord.RichEmbed();
                            var statusdesc = message.guild.roles.get(config.dbAlertsRoleID).toString() + "\n\n" + message.author.username + "#" + message.author.discriminator + " started a Drunkerbox Livestream!\n\n" + args[1];
                            embed.setImage(message.author.displayAvatarURL);
                            embed.addField("Drunkerbox Status", statusdesc);
                            message.channel.send({
                                embed
                            });
                            client.user.setStatus('available')
                            client.user.setPresence({
                                game: {
                                    name: 'DrunkerBox',
                                    type: "STREAMING",
                                    url: args[1]
                                }
                            });
                        } else {
                            logger.verbose(message.author.username + "#" + message.author.discriminator + " attempted to start a drunkerbox, but did not set a URL.")
                            message.author.send("Hey! You need to set the URL for the livestream!")
                        }
                    } else {
                        logger.verbose("Stream is already active.");
                    }
                });

                break;

                /*
                ███████ ████████  ██████  ██████
                ██         ██    ██    ██ ██   ██
                ███████    ██    ██    ██ ██████
                     ██    ██    ██    ██ ██
                ███████    ██     ██████  ██
                */

            case 'stop':
                db.get("SELECT * FROM dboxes WHERE state = 1;", function(err, results) {
                    if (message.member.roles.has(config.serverModID) || drunkerstatus.hostid == message.author.id) {
                        if (results != undefined) {
                            db.run("UPDATE dboxes SET stoptime = " + moment().unix() + ", state = 0 WHERE state = 1;");
                            logger.verbose(message.author.username + "#" + message.author.discriminator + " stopped the drunkerbox");
                            message.channel.send(message.author.username + "#" + message.author.discriminator + " stopped the drunkerbox");
                            message.member.removeRole(config.dbHostRoleID).catch(console.error);
                            client.user.setStatus('idle')
                            client.user.setPresence({
                                game: {
                                    name: 'none',
                                    type: "none",
                                    url: 'none'
                                }
                            });
                        } else {
                            message.channel.send("Stream is not currently active.");
                            logger.verbose("Stream is not currently active.");
                        }
                    } else {
                        message.channel.send("Nice try, but only the Host or a Moderator can stop a drunkerbox stream!")
                    }
                });
                break;

                /*
                ███████ ████████  █████  ████████ ██    ██ ███████
                ██         ██    ██   ██    ██    ██    ██ ██
                ███████    ██    ███████    ██    ██    ██ ███████
                     ██    ██    ██   ██    ██    ██    ██      ██
                ███████    ██    ██   ██    ██     ██████  ███████
                */

            case 'status':
                db.get("SELECT * FROM dboxes WHERE state = 1;", function(err, results) {
                    var embed = new Discord.RichEmbed();
                    if (results != undefined) {
                        var statusdesc = "Host: " + results.hostname + "\n Time started: " + moment.unix(results.starttime).format("MMM DD, hh:mm");
                        embed.setImage(results.hostpic);
                        if (results.url != "none")
                            statusdesc += "\n Link: " + results.url;
                    } else {
                        var statusdesc = "No drunkerbox is currently live";
                    }
                    embed.addField("Drunkerbox Status", statusdesc);
                    message.channel.send({
                        embed
                    });
                });

                break;

                /*
                ██████  ██████   █████  ███████ ███████
                ██   ██ ██   ██ ██   ██ ██      ██
                ██   ██ ██████  ███████ ███████ █████
                ██   ██ ██   ██ ██   ██      ██ ██
                ██████  ██████  ██   ██ ███████ ███████
                */

            case 'dbase':
                db.all("SELECT * FROM fans;", function(err, results) {
                    if (results !== "") {
                        var statusdesc = "Registered users: " + results.length + "\n";
                        var ttlcount = 0;
                        var alertcount = 0;
                        results.forEach(function(item, index) {
                            alertcount += results[index].alerts;
                            ttlcount += results[index].msgcount;
                        });
                        statusdesc += "Alerts set: " + alertcount + "\n";
                        statusdesc += "Messages sent: " + ttlcount + "\n";
                        var embed = new Discord.RichEmbed()
                        embed.addField("Drunkerbox Database Stats", statusdesc);
                        message.channel.send({
                            embed
                        });
                    } else {
                        //Handle the empty database here
                    }
                });
                break;

                /*
                 █████  ██████   ██████  ██    ██ ████████
                ██   ██ ██   ██ ██    ██ ██    ██    ██
                ███████ ██████  ██    ██ ██    ██    ██
                ██   ██ ██   ██ ██    ██ ██    ██    ██
                ██   ██ ██████   ██████   ██████     ██
                */

            case 'about':
                db.get("SELECT * FROM dbotstats;", function(err, results) {
                    if (results != undefined) {
                        var statusdesc = "App Version: " + results.appver + "\n";
                        statusdesc += "Times Started: " + results.restarts + "\n";
                        statusdesc += "Last Started: " + moment.unix(results.laststart).format('M/D/YY HH:mm') + "\n";
                        statusdesc += "Web Hits: " + results.webhits + "\n";
                        var embed = new Discord.RichEmbed()
                        embed.addField("Drunkerbot Stats", statusdesc);
                        message.channel.send({
                            embed
                        });
                    } else {
                        logger.error("Um... No dbotstat table in database? Weird.")
                    }
                });
                break;
                /*
                 ██████  ██ ████████
                ██       ██    ██
                ██   ███ ██    ██
                ██    ██ ██    ██
                 ██████  ██    ██
                */

            case 'git':
                var statusdesc = "You can find my code at:\nhttps://github.com/HardWareFlare/drunkerbot\n\nYou can find the drunkertracker code at:\nhttps://github.com/IntPirate/DrunkerBoxes";
                var embed = new Discord.RichEmbed()
                embed.addField("Drunkerbox Git Repo", statusdesc)
                message.channel.send({
                    embed
                });
                break;

                /*
                 █████  ██      ███████ ██████  ████████ ███████
                ██   ██ ██      ██      ██   ██    ██    ██
                ███████ ██      █████   ██████     ██    ███████
                ██   ██ ██      ██      ██   ██    ██         ██
                ██   ██ ███████ ███████ ██   ██    ██    ███████
                */

            case 'alerts':
                //Database method
                db.all("SELECT * FROM fans WHERE fanname = \'" + message.author.username + "#" + message.author.discriminator + "\';", function(err, results) {
                    if (results == "") {
                        console.log("Couldn't find that user");
                        db_newuser(message.author, message.member);
                        console.log("Created a new profile for: " + message.author.username + "#" + message.author.discriminator);
                        // Let the user know if it succeeded
                        message.member.addRole(config.dbAlertsRoleID).catch(console.error);
                        message.author.send("Hi! I created a new profile for you!\n\nYour alerts are set to false.\nUse \"!db alerts\" to sign up for alerts.");
                    } else {
                        db.run("UPDATE fans SET alerts = " + !results[0].alerts + " WHERE fanname = \'" + message.author.username + "#" + message.author.discriminator + "\';");
                        console.log(message.author.username + "#" + message.author.discriminator + " set their alerts to " + !results[0].alerts);
                        message.author.send("You set your alerts to " + !results[0].alerts);
                    }
                });
                break;

                /*
                ██   ██  █████  ██████  ███    ███  █████
                ██  ██  ██   ██ ██   ██ ████  ████ ██   ██
                █████   ███████ ██████  ██ ████ ██ ███████
                ██  ██  ██   ██ ██   ██ ██  ██  ██ ██   ██
                ██   ██ ██   ██ ██   ██ ██      ██ ██   ██
                */

            case 'karma':
                if (!message.mentions.users.size) {
                    var karmauser = message.author;
                    var karmamember = message.member;
                } else {
                    var karmauser = message.mentions.users.first();
                    var karmamember = message.mentions.members.first();
                }

                db.all("SELECT * FROM fans WHERE fanname = \'" + karmauser.username + "#" + karmauser.discriminator + "\';", function(err, results) {
                    if (results == "") {
                        logger.warn("Couldn't find that user");
                        db_newuser(karmauser, karmamember);
                        message.channel.send(message.mentions.users.first() + " didn\'t have a profile so I made one without their permission. They'll thank me later.");
                    } else {
                        var embed = new Discord.RichEmbed()
                        var statusdesc = "Updoots: " + (results[0].updootcount / dootee_bonus) + "\nDowndoots: " + (results[0].downdootcount / dootee_bonus) + "\nBalance: " + parseInt((results[0].updootcount / (results[0].updootcount + results[0].downdootcount)) * 100) + "%";
                        embed.addField(karmauser.username + "#" + karmauser.discriminator + "\nKarma Score:", statusdesc);
                        message.channel.send({
                            embed
                        });
                    }
                });
                break;
                /*
                ██   ██ ███████ ██      ██████
                ██   ██ ██      ██      ██   ██
                ███████ █████   ██      ██████
                ██   ██ ██      ██      ██
                ██   ██ ███████ ███████ ██
                */

            case 'help':
                //"!db help <command>" should give more info on the individual command
                var statusdesc = "**!db start <url>**\nStart a drunkerbox stream and link tothe provided <url>\n";
                statusdesc += "**!db stop**\nStop and clear the drunkerbox\n";
                statusdesc += "**!db status**\nDisplay summary of the currently running drunkerbox stream\n";
                statusdesc += "**!db dbase**\nDisplay stats about the DrunkerBoxes database\n";
                statusdesc += "**!db about**\nDisplay stats about drunkerbot\n";
                statusdesc += "**!db git**\nLinks to Drunkerboxes related Git Repos\n";
                statusdesc += "**!db alerts**\nToggle alerts for DrunkerBoxes for yourself\n";
                statusdesc += "**!db api**\nDrunkerbot API information"
                var embed = new Discord.RichEmbed()
                embed.addField("Drunkerbox Status", statusdesc)
                message.channel.send({
                    embed
                });
                break;

            case 'api':
                statusdesc += "\nhttps:\/\/drunkerbot.hardwareflare.com/\nFor a human-readable drunkerbox stream status on your browser!\n";
                statusdesc += "\nFor API endpoints, send a GET request to \nhttps:\/\/drunkerbot.hardwareflare.com/api/status/\nor\nhttps:\/\/drunkerbot.hardwareflare.com/api/status/<property>\n";
                statusdesc += "\n<property> includes:\n";
                statusdesc += "**state**\nLatest stream state\n";
                statusdesc += "**host**\nHost's username#discriminator\n";
                statusdesc += "**hostid**\nHost's discord snowflake\n";
                statusdesc += "**hostpic**\nHost's avatar URL\n";
                statusdesc += "**url**\nURL of livestream\n";
                statusdesc += "**startime**\nUnix time the stream started\n";
                statusdesc += "**stoptime**\nUnix time the stream ended";
                var embed = new Discord.RichEmbed();
                embed.addField("Drunkerbox API", statusdesc);
                message.channel.send({
                    embed
                });
                break;
                /*
                ██████  ███████ ███████  █████  ██    ██ ██   ████████
                ██   ██ ██      ██      ██   ██ ██    ██ ██      ██
                ██   ██ █████   █████   ███████ ██    ██ ██      ██
                ██   ██ ██      ██      ██   ██ ██    ██ ██      ██
                ██████  ███████ ██      ██   ██  ██████  ███████ ██
                */

            default:
                message.channel.send("You did not enter a command that I know :\(");
                break;
        }
    }
});

/*
 █████  ██████  ██
██   ██ ██   ██ ██
███████ ██████  ██
██   ██ ██      ██
██   ██ ██      ██
*/

app.get('/api/status/', function(req, res) {

    // This API promise needs to be put in a repeatable function instead of
    // existing multiple times across the whole application
    var APIpromise = new Promise(function(resolve, reject) {
        db.get("SELECT * FROM dboxes WHERE state = 1;", function(err, results) {
            if (results == undefined) {
                results = defaultResults;
                resolve(results); // reject
            } else {
                results.state = true;
                resolve(results); // fulfilled
            }
        });
    });

    APIpromise.then(function(results) {
        res.set('Content-Type', 'application/json');
        res.send(results);
    }, function() {
        logger.error("No active drunkerbox found.");
    })
});

app.get('/api/status/:endpoint', function(req, res) {

    var APIpromise = new Promise(function(resolve, reject) {
        db.get("SELECT * FROM dboxes WHERE state = 1;", function(err, results) {
            if (results == undefined) {
                results = defaultResults;
                resolve(results); // reject
            } else {
                results.state = true;
                resolve(results); // fulfilled
            }
        });
    });

    APIpromise.then(function(results) {
        res.set('Content-Type', 'application/json');
        switch (req.params.endpoint) {
            case undefined:
                res.send(results);
                break;
            case 'state':
                res.send(results.state);
                break;
            case 'hostname':
                res.send(results.hostname);
                break;
            case 'hostid':
                res.send(results.hostid);
                break;
            case 'hostpic':
                res.send(results.hostpic);
                break;
            case 'url':
                res.send(results.url);
                break;
            case 'starttime':
                res.send(results.starttime);
                break;
        }
    }, function() {
        logger.error("No active drunkerbox found.");
    })
});

/*
██     ██ ███████ ██████      ██████   █████   ██████  ███████
██     ██ ██      ██   ██     ██   ██ ██   ██ ██       ██
██  █  ██ █████   ██████      ██████  ███████ ██   ███ █████
██ ███ ██ ██      ██   ██     ██      ██   ██ ██    ██ ██
 ███ ███  ███████ ██████      ██      ██   ██  ██████  ███████
*/

app.get('/', function(req, res) {

    var statusPromise = new Promise(function(resolve, reject) {
        db.get("SELECT * FROM dboxes WHERE state = 1;", function(err, results) {
            if (results == undefined) {
                results = defaultResults;
                resolve(results); // reject
            } else {
                results.state = true;
                resolve(results); // fulfilled
            }
        });
    });

    var dootsPromise = new Promise(function(resolve, reject) {
        db.all("SELECT * FROM fans ORDER BY updootcount DESC LIMIT 10;", function(err, results) {
            if (results == "") {
                logger.error("Somehow, nobody has updoots");
                reject(); // reject
            } else {
                resolve(results); // fulfilled
            }
        });
    });

    var dboxesPromise = new Promise(function(resolve, reject) {
        db.all("SELECT * FROM dboxes ORDER BY starttime DESC;", function(err, results) {
            if (results == "") {
                logger.error("Somehow, nobody has dboxed yet")
                resolve(results); // reject
            } else {
                resolve(results); // fulfilled
            }
        });
    });

    var dbotstatsPromise = new Promise(function(resolve, reject) {
        db.get("SELECT * FROM dbotstats;", function(err, results) {
            if (results != undefined) {
                webhits = results.webhits;
                db.run("UPDATE dbotstats SET webhits = " + parseInt(results.webhits + 1) + ";");
                resolve(results);
            } else {
                logger.error("Um... No dbotstat table in database? Weird.")
                resolve(results);
            }
        });
    });

    var collectAndRespond = function() {
        Promise.all([statusPromise, dboxesPromise, dootsPromise, dbotstatsPromise]).then(function(values) {
            res.render('index', {
                drunkerstatus: values[0],
                dboxes: values[1],
                doots: values[2],
                dbotstats: values[3]
            })
        }).catch();
    }

    collectAndRespond();

});


/*
██     ██ ███████ ██████  ██   ██  ██████   ██████  ██   ██ ███████
██     ██ ██      ██   ██ ██   ██ ██    ██ ██    ██ ██  ██  ██
██  █  ██ █████   ██████  ███████ ██    ██ ██    ██ █████   ███████
██ ███ ██ ██      ██   ██ ██   ██ ██    ██ ██    ██ ██  ██       ██
 ███ ███  ███████ ██████  ██   ██  ██████   ██████  ██   ██ ███████
*/

app.post('/webhooks', function(req, res) {
    logger.debug(req.body);
});
