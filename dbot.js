//Load Discord library and create a new client
const Discord = require('discord.js');
const discordClient = new Discord.Client();
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
const fetch = require('node-fetch');
//Interfaces with sqlite3 database
const sqlite3 = require('sqlite3');
// const db = new sqlite3.Database('data/dbdbase.db');
const db = new sqlite3.Database('data/botbase.db');

//Validates URLs
//const urlExists = require('url-exists');
//Reddit wrapper and API library
var Snooper = require('reddit-snooper')
snooper = new Snooper({
    // credential information is not needed for snooper.watcher
    // username:
    // password:
    // app_id:
    // api_secret:
    //user_agent: 'drunkerbot',
    automatic_retries: true, // automatically handles condition when reddit says 'you are doing this too much'
    api_requests_per_minute: 60 // api requests will be spread out in order to play nicely with Reddit
})

// Create a Snoostorm CommentStream with the specified options
// const RcommentClient = new Snoostorm.CommentStream(redditConfig);

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
        format.printf(info => `\(${info.timestamp}\) \[${info.level}\]: ${info.message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: './data/dbot.log'
        })
    ]
});

//Set up express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static("public"));
// Routes
app.use('/api/discord', require('./api/discord'));

//Iterate this each time you update the bot
const appver = "1.0.1";

const PORT = "3000";

const TIMERRESET = 15; // Number of seconds before getting more exp
const LEVELMULTIPLIER = 100; // You need this much experience * your current level to level up
const MAXEXPGAIN = 5; // Each time you gain exp, it's between 0 and this number
const EXPMULTIPLIER = 5; // Then it's multiplied by this number

const DOOTEE_BONUS = 1;
const DOOTER_BONUS = 0.25;

const defaultResults = {
    "state": false,
    "host": "none",
    "userdiscordID": "none",
    "userAvatar": "none",
    "url": "none",
    "start": "none",
    "end": "none"
}

// Login from envar
discordClient.login(process.env.BOTSECRET);

discordClient.on('ready', () => {
    logger.verbose(`Logged in as ${discordClient.user.tag}!`);
    discordClient.user.setStatus('idle');
});

// start the server in the port 3000 !
app.listen(PORT, function() {
    logger.verbose('Listening on port ' + PORT + '.');
    //Mid-drunkerbox stream crash recovery
    db.get("SELECT * FROM STREAM WHERE state = 1;", function(err, results) {
        if (results != undefined) {
            db.run("UPDATE STREAM SET end = " + moment().unix() + ", state = 0 WHERE state = 1;");
            logger.warn("Old live-stream was stopped.");
        }
    });
    db.get("SELECT * FROM BOTSTATS;", function(err, results) {
        if (results != undefined) {
            db.run("UPDATE BOTSTATS SET laststart = " + moment().unix() + ", restarts = " + parseInt(results.restarts + 1) + ", appver = \'" + appver + "\';");
            logger.verbose("Running appver " + appver);
        } else {
            logger.error("Um... No BOTSTATS table in database? Weird.")
        }
    });
});

/*
██    ██ ███████ ███████ ███████ ██    ██ ██          ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████
██    ██ ██      ██      ██      ██    ██ ██          ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██
██    ██ ███████ █████   █████   ██    ██ ██          █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████
██    ██      ██ ██      ██      ██    ██ ██          ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
 ██████  ███████ ███████ ██       ██████  ███████     ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████
*/

function barwidth(floor, ceiling, current) {
    var cX = current - floor; //Current level experience
    var nX = ceiling - floor; //neeeded experience to level
    var pC = cX / nX; //percent of level completed
    var cbW = pC * bW; //current Bar Width
    return cbW;
}

//For converting hex to gradients
function hexToRgb(hex) {
    if (hex == "#000000") {
        hex = "#FFFFFF";
    }
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Create gradient
function makeGRD(Re, Ge, Be, L2R, T2B) {
    var grd = ctx.createLinearGradient(0, 0, L2R, T2B);
    grd.addColorStop(0, 'rgba(' + Math.round(Re / 2) + ',' + Math.round(Ge / 2) + ',' + Math.round(Be / 2) + ',1)');
    grd.addColorStop(1, 'rgba(' + Re + ',' + Ge + ',' + Be + ',1)');

    return grd;
}

//Call this to create a new user in the database
function db_newuser(newuserauthor, newusermember) {
    db.run("INSERT INTO USER (discordID, alerts, messages, updoots, downdoots, updooty, downdooty) VALUES (\'" + newuserauthor.id + "\', 0, 1, 0, 0, 0, 0);", function(err) {
        // Let the user know if it succeeded
        logger.verbose("Created a new profile for: " + newuserauthor.username + "\n");
        newuserauthor.send("Hi! I created a new profile for you!\n\nYour alerts are set to false.\nUse \"!db alerts\" to sign up for alerts.");
    });
}

/*
 ██████  █████  ██      ██           ██████  ███████     ██████   ██████   ██████  ████████ ██    ██
██      ██   ██ ██      ██          ██    ██ ██          ██   ██ ██    ██ ██    ██    ██     ██  ██
██      ███████ ██      ██          ██    ██ █████       ██   ██ ██    ██ ██    ██    ██      ████
██      ██   ██ ██      ██          ██    ██ ██          ██   ██ ██    ██ ██    ██    ██       ██
 ██████ ██   ██ ███████ ███████      ██████  ██          ██████   ██████   ██████     ██       ██
*/

discordClient.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.author != reaction.users.last()) {
        doot(reaction.message.author, reaction.emoji.name, DOOTEE_BONUS);
        doot(user, reaction.emoji.name, DOOTER_BONUS);
    }
});

discordClient.on('messageReactionRemove', (reaction, user) => {
    if (reaction.message.author != reaction.users.last()) {
        doot(reaction.message.author, reaction.emoji.name, DOOTEE_BONUS * -1);
        doot(user, reaction.emoji.name, DOOTER_BONUS * -1);
    }
});

discordClient.on('messageReactionRemoveAll', (reaction, user) => {
    //Learn how this works
});

function doot(dootUser, dootemoji, adjust) {
    //This is sloppy code, I know.
    if (dootemoji === "upvote" || dootemoji === "downvote" || dootemoji === "updoot" || dootemoji === "downdoot") {
        //Find user in database (create new function that does this)
        db.all("SELECT * FROM USER WHERE discordID = \'" + dootUser.id + "\';", function(err, results) {
            if (results == "") {
                logger.warn("Couldn't find that user: " + dootUser.id + "#" + dootUser.discriminator);
                db_newuser(dootUser);
            }
            //save to db
            if (dootemoji === "upvote") {
                db.run("UPDATE USER SET updoots = " + (results[0].updoots + adjust) + " WHERE discordID = \'" + dootUser.id + "\';");
            }
            if (dootemoji === "downvote") {
                db.run("UPDATE USER SET downdoots = " + (results[0].downdoots + adjust) + " WHERE discordID = \'" + dootUser.id + "\';");
            }
        });
    }
}

/*
██████  ███████ ██████  ██████  ██ ████████     ███████ ███    ██  ██████   ██████  ██████  ███████ ██████
██   ██ ██      ██   ██ ██   ██ ██    ██        ██      ████   ██ ██    ██ ██    ██ ██   ██ ██      ██   ██
██████  █████   ██   ██ ██   ██ ██    ██        ███████ ██ ██  ██ ██    ██ ██    ██ ██████  █████   ██████
██   ██ ██      ██   ██ ██   ██ ██    ██             ██ ██  ██ ██ ██    ██ ██    ██ ██      ██      ██   ██
██   ██ ███████ ██████  ██████  ██    ██        ███████ ██   ████  ██████   ██████  ██      ███████ ██   ██
*/

snooper.watcher.getCommentWatcher('hardwareflare').on('comment', function(comment) {
    newsnoo(comment, 'comment');
});
snooper.watcher.getPostWatcher('hardwareflare').on('post', function(post) {
    newsnoo(post, 'post');
});

function newsnoo(data, datatype) {
    console.log('/u/' + data.data.author + ' made a new ' + datatype + ':');
    //console.log(data.data);
    var embed = new Discord.RichEmbed();
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

/*
██████  ██ ███████  ██████  ██████  ██████  ██████      ███    ███ ███████ ███████ ███████  █████   ██████  ███████ ███████
██   ██ ██ ██      ██      ██    ██ ██   ██ ██   ██     ████  ████ ██      ██      ██      ██   ██ ██       ██      ██
██   ██ ██ ███████ ██      ██    ██ ██████  ██   ██     ██ ████ ██ █████   ███████ ███████ ███████ ██   ███ █████   ███████
██   ██ ██      ██ ██      ██    ██ ██   ██ ██   ██     ██  ██  ██ ██           ██      ██ ██   ██ ██    ██ ██           ██
██████  ██ ███████  ██████  ██████  ██   ██ ██████      ██      ██ ███████ ███████ ███████ ██   ██  ██████  ███████ ███████
*/

discordClient.on('message', message => {

    /*
    ███    ███ ███████ ███████ ███████  █████   ██████  ███████      ██████  ██████  ██    ██ ███    ██ ████████ ███████ ██████
    ████  ████ ██      ██      ██      ██   ██ ██       ██          ██      ██    ██ ██    ██ ████   ██    ██    ██      ██   ██
    ██ ████ ██ █████   ███████ ███████ ███████ ██   ███ █████       ██      ██    ██ ██    ██ ██ ██  ██    ██    █████   ██████
    ██  ██  ██ ██           ██      ██ ██   ██ ██    ██ ██          ██      ██    ██ ██    ██ ██  ██ ██    ██    ██      ██   ██
    ██      ██ ███████ ███████ ███████ ██   ██  ██████  ███████      ██████  ██████   ██████  ██   ████    ██    ███████ ██   ██
    */

    //USERS SHOULD BE ABLE TO OPT OUT OF THIS AND ALL TRACKING
    if (!message.author.bot) {
        db.get("SELECT * FROM USER WHERE discordID = \'" + message.author.id + "\';", function(err, results) {
            if (results == undefined) {
                logger.warn("Couldn't find that user");
                db.get("SELECT * FROM USER WHERE username = \'" + message.author.username + "#" + message.author.discriminator + "\';", function(err, RECOVERres) {
                    db_newuser(message.author, message.member);
                });
            } else {
                if (message.author.username != results.username) {
                    db.run("UPDATE USER SET username = \'" + message.author.username + "\' WHERE discordID = \'" + message.author.id + "\';");
                }
                if (moment().unix() - results.lastmessage < TIMERRESET) {
                    db.run("UPDATE USER SET messages = messages + 1 WHERE discordID = \'" + message.author.id + "\';");
                } else {
                    var expbonus = (Math.floor(Math.random() * (MAXEXPGAIN + 1)) * EXPMULTIPLIER);
                    db.run("UPDATE USER SET messages = messages + 1, lastmessage = " + moment().unix() + ", exp = exp + " + expbonus + " WHERE discordID = \'" + results.discordID + "\';", function() {
                        //Check to see if they leveled up here
                        var levelCount = 0;
                        var expCount = 0;
                        while (results.exp > expCount) {
                            levelCount++;
                            expCount = expCount + (levelCount * LEVELMULTIPLIER);
                        }
                        if (levelCount > results.lastlevel) {
                            db.run("UPDATE USER SET lastlevel = " + levelCount + " WHERE discordID = \'" + results.discordID + "\';");
                        }
                    });
                }
            }
        });
    }

    if (!message.author.bot) {
        db.get("SELECT * FROM MESSAGES WHERE userdiscordID = \'" + message.author.id + "\' AND channeldiscordID = \'" + message.channel.id + "\' AND serverdiscordID = \'" + message.guild.id + "\';", function(error, results) {
            if (results == undefined) {
                logger.warn("Couldn't find that user/channel/server combo.");
                db.run("INSERT INTO MESSAGES (userdiscordID, channeldiscordID, serverdiscordID, messages) VALUES (\'" + message.author.id + "\', \'" + message.channel.id + "\', \'" + message.guild.id + "\', 1);", function(err) {
                    logger.verbose("Created a message counter combo for: " + message.author.username);
                });
            } else {
                db.run("UPDATE MESSAGES SET messages = messages + 1 WHERE userdiscordID = \'" + message.author.id + "\' AND channeldiscordID = \'" + message.channel.id + "\' AND serverdiscordID = \'" + message.guild.id + "\';");
            }
        });
    }

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

                // snooper.api.post("/api/submit", {
                //     api_type: "json",
                //     kind: 'self',
                //     sr: 'drunkerbot',
                //     title: 'Hello World',
                //     text: 'I\'m sending you some sunshine!'
                // }, function(err, statusCode, data) {
                //     if (!err) console.log('Just posted to reddit')
                // })

                break;

                /*
                ██████  ██    ██ ███    ██
                ██   ██ ██    ██ ████   ██
                ██████  ██    ██ ██ ██  ██
                ██   ██ ██    ██ ██  ██ ██
                ██   ██  ██████  ██   ████
                */

                //     // THIS ISN'T ZOMBIE CODE!
                //     // This code is very functional, but allows users to run totally arbitrary code from the discord channel
                //     // Consider the commenting out this code as the "Safety On"
                // case 'run':
                //     if (message.member.permissions.has('ADMINISTRATOR')) {
                //
                //         var commandstore = message.content;
                //
                //         var myRegexp = /```([^```]*)```/g;
                //         var arr = [];
                //
                //         //Iterate through results of regex search
                //         do {
                //             var match = myRegexp.exec(commandstore);
                //             if (match != null) {
                //                 //Each call to exec returns the next match as an array where index 1
                //                 //is the captured group if it exists and index 0 is the text matched
                //                 arr.push(match[1] ? match[1] : match[0]);
                //             }
                //         } while (match != null);
                //
                //         //console.log(arr.toString());
                //         eval(arr.toString());
                //     } else {
                //         message.channel.send("This command can only be used by Administrators on this server. It really shouldn't be used by anybody ever. It shouldn't exist. This is irresponsible.")
                //     }
                //
                //     break;

                /*
                ███████ ████████  █████  ██████  ████████
                ██         ██    ██   ██ ██   ██    ██
                ███████    ██    ███████ ██████     ██
                     ██    ██    ██   ██ ██   ██    ██
                ███████    ██    ██   ██ ██   ██    ██
                */

            case 'start':
                db.get("SELECT * FROM SERVER WHERE discordID = \'" + message.guild.id + "\';", function(err, SERVERres) {
                    db.get("SELECT * FROM STREAM WHERE serverdiscordID = \'" + message.guild.id + "\'AND state = 1;", function(err, results) {
                        if (results == undefined) {
                            if (args[1] != null) {
                                //Validate the the URL here
                                db.run("INSERT INTO STREAM (state, serverdiscordID, userdiscordID, userAvatar, url, start) VALUES (1, \'" + message.guild.id + "\', \'" + message.author.id + "\', \'" + message.author.displayAvatarURL + "\', \'" + args[1] + "\', " + moment().unix() + ");");
                                logger.verbose(message.author.username + "#" + message.author.discriminator + " started a drunkerbox");
                                message.member.addRole(SERVERres.hostRoleID);
                                var embed = new Discord.RichEmbed();
                                var statusdesc = message.guild.roles.get(SERVERres.alertRoleID).toString() + "\n\n" + message.author.username + "#" + message.author.discriminator + " started a Drunkerbox Livestream!\n\n" + args[1];
                                embed.setImage(message.author.displayAvatarURL);
                                embed.addField("Drunkerbox Status", statusdesc);
                                message.channel.send({
                                    embed
                                });
                                discordClient.user.setStatus('available');
                                discordClient.user.setPresence({
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
                db.get("SELECT * FROM SERVER WHERE discordID = \'" + message.guild.id + "\';", function(err, SERVERres) {
                    db.get("SELECT * FROM STREAM WHERE serverdiscordID = \'" + message.guild.id + "\'AND state = 1;", function(err, results) {
                        if (message.member.roles.has(SERVERres.modRoleID) || drunkerstatus.userdiscordID == message.author.id) {
                            if (results != undefined) {
                                db.run("UPDATE STREAM SET end = " + moment().unix() + ", state = 0 WHERE state = 1;");
                                logger.verbose(message.author.username + "#" + message.author.discriminator + " stopped the drunkerbox");
                                message.channel.send(message.author.username + "#" + message.author.discriminator + " stopped the drunkerbox");
                                message.member.removeRole(SERVERres.hostRoleID).catch(console.error);
                                discordClient.user.setStatus('idle')
                                discordClient.user.setPresence({
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
                db.get("SELECT * FROM STREAM WHERE state = 1;", function(err, results) {
                    var embed = new Discord.RichEmbed();
                    if (results != undefined) {
                        var statusdesc = "Host: " + results.hostname + "\n Time started: " + moment.unix(results.start).format("MMM DD, hh:mm");
                        embed.setImage(results.userAvatar);
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
                db.all("SELECT * FROM USER;", function(err, results) {
                    if (results !== "") {
                        var statusdesc = "Registered users: " + results.length + "\n";
                        var ttlcount = 0;
                        var alertcount = 0;
                        var udccount = 0;
                        var ddccount = 0;
                        results.forEach(function(item, index) {
                            alertcount += results[index].alerts;
                            ttlcount += results[index].messages;
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
                break;

                /*
                 █████  ██████   ██████  ██    ██ ████████
                ██   ██ ██   ██ ██    ██ ██    ██    ██
                ███████ ██████  ██    ██ ██    ██    ██
                ██   ██ ██   ██ ██    ██ ██    ██    ██
                ██   ██ ██████   ██████   ██████     ██
                */

            case 'about':
                db.get("SELECT * FROM BOTSTATS;", function(err, results) {
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
                        logger.error("Um... No BOTSTATS table in database? Weird.")
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
                db.get("SELECT * FROM SERVER WHERE discordID = \'" + message.guild.id + "\';", function(err, SERVERres) {
                    db.all("SELECT * FROM USER WHERE discordID = \'" + message.author.id + "\';", function(err, results) {
                        if (results == "") {
                            console.log("Couldn't find that user");
                            db_newuser(message.author, message.member);
                            console.log("Created a new profile for: " + message.author.username + "#" + message.author.discriminator);
                            // Let the user know if it succeeded
                            message.member.addRole(SERVERres.alertRoleID).catch(console.error);
                            message.author.send("Hi! I created a new profile for you!\n\nYour alerts are set to false.\nUse \"!db alerts\" to sign up for alerts.");
                        } else {
                            db.run("UPDATE USER SET alerts = " + !results[0].alerts + " WHERE discordID = \'" + message.author.id + "\';");
                            message.member.removeRole(SERVERres.alertRoleID).catch(console.error);
                            console.log(message.author.username + "#" + message.author.discriminator + " set their alerts to " + !results[0].alerts);
                            message.author.send("You set your alerts to " + !results[0].alerts);
                        }
                    });
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

                db.get("SELECT * FROM USER WHERE discordID = \'" + karmauser.id + "\';", function(err, results) {
                    if (results == "") {
                        logger.warn("Couldn't find that user");
                        db_newuser(karmauser, karmamember);
                        message.channel.send(message.mentions.users.first() + " didn\'t have a profile so I made one without their permission. They'll thank me later.");
                    } else {
                        var embed = new Discord.RichEmbed()
                        var statusdesc = "Updoots: " + results.updoots + "\nDowndoots: " + results.downdoots + "\nUpdoot Ratio: " + parseInt((results.updoots - results.downdoots) / DOOTEE_BONUS) / results.messages;
                        embed.addField(karmauser.username + "#" + karmauser.discriminator + "\nKarma Score:", statusdesc);
                        message.channel.send({
                            embed
                        });
                    }
                });
                break;

                /*
                ██     ██ ██   ██  ██████  ██ ███████
                ██     ██ ██   ██ ██    ██ ██ ██
                ██  █  ██ ███████ ██    ██ ██ ███████
                ██ ███ ██ ██   ██ ██    ██ ██      ██
                 ███ ███  ██   ██  ██████  ██ ███████
                */

            case 'whois':

                //Canvas Width
                const canW = 250;
                //Canvas Height
                const canH = 100;
                //Bar Width
                const bW = 230;
                //Bar Height
                const bH = 8
                //Bar position
                const bX = 10;
                const bY = 51;

                if (!message.mentions.users.size) {
                    var whoisuser = message.author;
                    var whoismember = message.member;
                } else {
                    var whoisuser = message.mentions.users.first();
                    var whoismember = message.mentions.members.first();
                }
                if (message.attachments.size) {
                    var pc_reply = "";
                    if (message.attachments.first().width != canW || message.attachments.first().height != canH) {
                        pc_reply += "This image isn't " + canW + "x" + canH + "px so it may look weird...\n\n... but ";
                    }
                    db.run("UPDATE USER SET pcbg_url = \'" + message.attachments.first().url + "\' WHERE discordID = \'" + message.author.id + "\';");
                    pc_reply += "I changed your background for you!";
                    message.channel.send(pc_reply)
                } else {
                    db.get("SELECT * FROM USER WHERE discordID = \'" + whoisuser.id + "\';", function(err, results) {
                        if (results == null) {
                            logger.warn("Couldn't find that user");
                            db_newuser(whoisuser, whoismember);
                            message.channel.send(message.mentions.users.first() + " didn\'t have a profile so I made one without their permission. They'll thank me later.");
                        } else {
                            var levelCount = 0;
                            var expCount = 0;
                            //Minimum experience needed for this level
                            var minL = 0;
                            while (results.exp > expCount) {
                                minL = expCount;
                                levelCount++;
                                expCount = expCount + (levelCount * LEVELMULTIPLIER);
                            }
                            const {
                                createCanvas,
                                loadImage
                            } = require('canvas');

                            const canvas = createCanvas(canW, canH)
                            const ctx = canvas.getContext('2d')

                            function barwidth(floor, ceiling, current) {
                                var cX = current - floor; //Current level experience
                                var nX = ceiling - floor; //neeeded experience to level
                                var pC = cX / nX; //percent of level completed
                                var cbW = pC * bW; //current Bar Width
                                return cbW;
                            }

                            //For converting hex to gradients
                            function hexToRgb(hex) {
                                if (hex == "#000000") {
                                    hex = "#FFFFFF";
                                }
                                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                return result ? {
                                    r: parseInt(result[1], 16),
                                    g: parseInt(result[2], 16),
                                    b: parseInt(result[3], 16)
                                } : null;
                            }

                            // Create gradient
                            function makeGRD(Re, Ge, Be, L2R, T2B) {
                                var grd = ctx.createLinearGradient(0, 0, L2R, T2B);
                                grd.addColorStop(0, 'rgba(' + Math.round(Re / 2) + ',' + Math.round(Ge / 2) + ',' + Math.round(Be / 2) + ',1)');
                                grd.addColorStop(1, 'rgba(' + Re + ',' + Ge + ',' + Be + ',1)');

                                return grd;
                            }

                            const userColor = hexToRgb(whoismember.displayHexColor);

                            if (results.pcbg_url == undefined) {
                                var playerCard_source = './data/playercards/pc_def_hwf.png';
                            } else {
                                var playerCard_source = results.pcbg_url;
                            }

                            loadImage(playerCard_source).then((playercardimg) => {
                                //Draw the playercard background
                                ctx.drawImage(playercardimg, 0, 0, 250, 100);
                                loadImage('./data/playercards/frame.png').then((frameimg) => {
                                    ctx.drawImage(frameimg, 0, 0, 250, 100);
                                    // Draw XP bar
                                    ctx.fillStyle = makeGRD(userColor.r, userColor.g, userColor.b, barwidth(minL, expCount, results.exp), 0); // Highest role color
                                    ctx.fillRect(bX, bY + 1, barwidth(minL, expCount, results.exp), bH); // draw bar
                                    // Start drawing text
                                    ctx.font = '18px Impact'
                                    ctx.fillStyle = 'rgba(' + userColor.r + ',' + userColor.g + ',' + userColor.b + ', 1)'; //User color
                                    ctx.fillText(whoisuser.username, 50, 25); // User name
                                    ctx.font = '14px Impact'
                                    ctx.fillStyle = 'rgba(255,255,255,1)';
                                    ctx.fillText(results.exp + " of " + expCount, 50, bY - 8) // XP numerals
                                    ctx.fillStyle = 'rgba(148,148,255,1)';
                                    ctx.fillText(results.downdoots, 160, canH - 10) // downdoots
                                    ctx.textAlign = 'right'
                                    ctx.fillStyle = 'rgba(255,68,0,1)';
                                    ctx.fillText(results.updoots, 90, canH - 10) //updoots
                                    ctx.fillStyle = 'rgba(255,255,255,1)';
                                    ctx.font = '32px Impact';
                                    ctx.fillText(levelCount, canW - 10, bY - 8); //Level numeral
                                    ctx.fillStyle = makeGRD(255, 68, 0, barwidth(0, parseInt(results.updoots + results.updooty + results.downdoots + results.downdooty), parseInt(results.updoots + results.updooty)), 0);
                                    ctx.fillRect(bX, bY + 15, barwidth(0, parseInt(results.updoots + results.updooty + results.downdoots + results.downdooty), parseInt(results.updoots + results.updooty)), 8);
                                    loadImage(whoisuser.avatarURL).then((avatarimg) => {
                                        ctx.drawImage(avatarimg, 11, 11, 32, 32);
                                        const out = fs.createWriteStream(__dirname + '/tempCard.png');
                                        const stream = canvas.createPNGStream();
                                        stream.pipe(out);
                                        out.on('finish', () => {
                                            const attachment = new Discord.Attachment('./tempCard.png', 'tempCard.png');
                                            const embed = new Discord.RichEmbed()
                                                .setTitle(whoisuser.username + '\'s Exp/Level')
                                                .attachFile(attachment)
                                                .setImage('attachment://tempCard.png')
                                            //.addField("Joined on: ", moment.unix(whoismember.joinedTimestamp).format('MM/DD/YY'));
                                            message.channel.send({
                                                embed
                                            });
                                        });
                                    });
                                });
                            });
                        }
                    });
                }
                break;

                /*
                ████████  ██████  ██████      ████████ ███████ ███    ██
                   ██    ██    ██ ██   ██        ██    ██      ████   ██
                   ██    ██    ██ ██████         ██    █████   ██ ██  ██
                   ██    ██    ██ ██             ██    ██      ██  ██ ██
                   ██     ██████  ██             ██    ███████ ██   ████
                */

            case 'top10':
                db.all("SELECT * FROM MESSAGES WHERE channeldiscordID = \'" + message.channel.id + "\' AND serverdiscordID = \'" + message.guild.id + "\' ORDER BY messages DESC LIMIT 10;", function(error, results) {
                    if (results !== "") {
                        //Bar Width / Height
                        const bW = 250;
                        const bH = 24
                        //Bar position
                        const bX = 10;
                        const bY = 51;
                        //Canvas Width  / Height
                        const canW = bW;
                        const canH = results.length * bH;

                        const {
                            createCanvas,
                            loadImage
                        } = require('canvas');

                        const canvas = createCanvas(canW, canH)
                        const ctx = canvas.getContext('2d')

                        loadImage('./data/nameBar.png').then((nameBar) => {
                            results.forEach(function(item, index) {
                                // embed.addField(discordClient.users.find(user => user.id === item.userdiscordID).username, item.messages);
                                //Draw the playercard background
                                ctx.drawImage(nameBar, 0, index * bH, bW, bH);
                                // Start drawing text
                                ctx.textAlign = 'left'
                                ctx.font = '12px Impact'
                                ctx.fillStyle = 'rgba(255,255,255,1)';
                                ctx.fillText(discordClient.users.find(user => user.id === item.userdiscordID).username, 12, 16 + (index * bH)); // User name
                                ctx.textAlign = 'right'
                                ctx.fillText(item.messages, canW - 12, 16 + (index * bH)); // User name
                            });
                            const out = fs.createWriteStream(__dirname + '/tempTop10.png');
                            const stream = canvas.createPNGStream();
                            stream.pipe(out);
                            out.on('finish', () => {
                                const attachment = new Discord.Attachment('./tempTop10.png', 'tempTop10.png');
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
                var statusdesc = "**!db start <url>**\nStart a drunkerbox stream and link to the provided <url>\n";
                statusdesc += "**!db stop**\nStop and clear the drunkerbox\n";
                statusdesc += "**!db status**\nDisplay summary of the currently running drunkerbox stream\n";
                statusdesc += "**!db dbase**\nDisplay stats about the DrunkerBoxes database\n";
                statusdesc += "**!db about**\nDisplay stats about drunkerbot\n";
                statusdesc += "**!db git**\nLinks to Drunkerboxes related Git Repos\n";
                statusdesc += "**!db alerts**\nToggle alerts for DrunkerBoxes for yourself\n";
                statusdesc += "**!db api**\nDrunkerbot API information\n"
                statusdesc += "**!db karma**\nCheck your or <mention>\'s Karma breakdown\n"
                statusdesc += "**!db whois <mention>**\nCheck your or <mention>\'s Player Card\'\n"
                statusdesc += "**!db top10**\nTop 10 in messages sent in the current channel"
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
                statusdesc += "**userdiscordID**\nHost's discord snowflake\n";
                statusdesc += "**userAvatar**\nHost's avatar URL\n";
                statusdesc += "**url**\nURL of livestream\n";
                statusdesc += "**startime**\nUnix time the stream started\n";
                statusdesc += "**end**\nUnix time the stream ended";
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
        db.get("SELECT * FROM STREAM WHERE state = 1;", function(err, results) {
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
        db.get("SELECT * FROM STREAM WHERE state = 1;", function(err, results) {
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
            case 'userdiscordID':
                res.send(results.userdiscordID);
                break;
            case 'userAvatar':
                res.send(results.userAvatar);
                break;
            case 'url':
                res.send(results.url);
                break;
            case 'start':
                res.send(results.start);
                break;
        }
    }, function() {
        logger.error("No active drunkerbox found.");
    })
});

app.use((err, req, res, next) => {
    switch (err.message) {
        case 'NoCodeProvided':
            return res.status(400).send({
                status: 'ERROR',
                error: err.message,
            });
        default:
            return res.status(500).send({
                status: 'ERROR',
                error: err.message,
            });
    }
});

/*
██     ██ ███████ ██████      ██████   █████   ██████  ███████
██     ██ ██      ██   ██     ██   ██ ██   ██ ██       ██
██  █  ██ █████   ██████      ██████  ███████ ██   ███ █████
██ ███ ██ ██      ██   ██     ██      ██   ██ ██    ██ ██
 ███ ███  ███████ ██████      ██      ██   ██  ██████  ███████
*/

app.get('/', function(req, res) {

    var userPromise = new Promise(function(resolve, reject) {
        var logindata;

        if (req.query.token != undefined) {
            logindata = getUserData(req.query.token);
        }

        async function getUserData(tokin) {
            const response = await fetch('https://discordapp.com/api/v6/users/@me', {
                method: 'GET',
                headers: {
                    //'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: 'Bearer ' + tokin,
                },
            });
            const userstuff = await response.json();
            return userstuff;
        }
        resolve(logindata);
    });

    var statusPromise = new Promise(function(resolve, reject) {
        db.get("SELECT * FROM STREAM WHERE state = 1;", function(err, results) {
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
        db.all("SELECT * FROM USER ORDER BY updoots DESC LIMIT 10;", function(err, results) {
            if (results == "") {
                logger.error("Somehow, nobody has updoots");
                reject(); // reject
            } else {
                resolve(results); // fulfilled
            }
        });
    });

    var STREAMPromise = new Promise(function(resolve, reject) {
        db.all("SELECT * FROM STREAM ORDER BY start DESC;", function(err, results) {
            if (results == "") {
                logger.error("Somehow, nobody has dboxed yet")
                resolve(results); // reject
            } else {
                resolve(results); // fulfilled
            }
        });
    });

    var dbotstatsPromise = new Promise(function(resolve, reject) {
        db.get("SELECT * FROM BOTSTATS;", function(err, results) {
            if (results != undefined) {
                webhits = results.webhits;
                db.run("UPDATE BOTSTATS SET webhits = " + parseInt(results.webhits + 1) + ";");
                resolve(results);
            } else {
                logger.error("Um... No dbotstat table in database? Weird.")
                resolve(results);
            }
        });
    });

    var collectAndRespond = function() {
        Promise.all([statusPromise, STREAMPromise, dootsPromise, dbotstatsPromise, userPromise]).then(function(values) {
            res.render('index', {
                drunkerstatus: values[0],
                dboxes: values[1],
                doots: values[2],
                dbotstats: values[3],
                logindata: values[4]
            })
        }).catch().catch().catch().catch().catch();
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
    res.end();
});

discordClient.on("error", console.error);
