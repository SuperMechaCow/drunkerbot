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
const appver = "0013";

const PORT = "3000";

const dbTokenFile = 'config.json';
const dbDataFile = 'dbdbase.json';

const dootee_bonus = 100;
const dooter_bonus = 25;

var config = null;

//THE FOLLOWING IS FLAGGED FOR REMOVAL (JSON TO SQL TRANSITION)
//SETTING UP THE DRUNKERBOX VARIABLES
var drunkerstatus = {
  "state": false,
  "host": "none",
  "hostid": "none",
  "hostpic": "none",
  "url": "none",
  "starttime": "none",
  "stoptime": "none"
}

// Login from token file
fs.readFile(dbTokenFile, 'utf8', function(err, data) {
  if (err) {
    return logger.error(err);
  }
  config = JSON.parse(data);
  client.login(config.token);
})

//THE FOLLOWING IS FLAGGED FOR REMOVAL (JSON TO SQL TRANSITION)
// Load "database"
var dbdbase;
fs.readFile(dbDataFile, 'utf8', function(err, data) {
  if (err) {
    return logger.error(err);
  }
  dbdbase = JSON.parse(data);
})

client.on('ready', () => {
  logger.verbose(`Logged in as ${client.user.tag}!`);
});

//Call this to create a new user in the database
function db_newuser(newuserauthor, newusermember) {
  db.run("INSERT INTO fans (fanname, alerts, msgcount, updootcount, downdootcount) VALUES (\'" + newuserauthor.username + "#" + newuserauthor.discriminator + "\', 0, 1, 0, 0);");
  logger.verbose("Created a new profile for: " + newuserauthor.username + "\n");
  // Let the user know if it succeeded
  newusermember.addRole(config.dbAlertsRoleID).catch(console.error);
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

function doot(dootee, dootemoji, adjust) {
  //This is sloppy code, I know.
  if (dootemoji === "upvote" || dootemoji === "downvote") {
    //Find user in database (create new function that does this)
    db.all("SELECT * FROM fans WHERE fanname = \'" + dootee.username + "#" + dootee.discriminator + "\';", function(err, results) {
      if (results == "") {
        logger.warn("Couldn't find that user: " + dootee.username + "#" + dootee.discriminator);
        db_newuser(message.author, message.member);
      }
      //save to db
      if (dootemoji === "upvote") {
        db.run("UPDATE fans SET updootcount = " + (results[0].updootcount + adjust) + " WHERE fanname = \'" + dootee.username + "#" + dootee.discriminator + "\';");
      }
      if (dootemoji === "downvote") {
        db.run("UPDATE fans SET downdootcount = " + (results[0].downdootcount + adjust) + " WHERE fanname = \'" + dootee.username + "#" + dootee.discriminator + "\';");
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
        //Rewrite this command to for testing new features

        // var getData;
        // db.all("SELECT * FROM fans", function(err, allRows) {
        //   if (err != null) {
        //     console.log(err);
        //     callback(err);
        //   }
        //   logger.debug(JSON.stringify(allRows));
        //   getData = allRows;
        // });
        //
        // logger.debug(JSON.stringify(getData));
        break;

        /*
        ███████ ████████  █████  ██████  ████████
        ██         ██    ██   ██ ██   ██    ██
        ███████    ██    ███████ ██████     ██
             ██    ██    ██   ██ ██   ██    ██
        ███████    ██    ██   ██ ██   ██    ██
        */

      case 'start':

        if (db.each("SELECT * FROM dboxes WHERE state = 0;", function(err, results) {
            return results
          }) == "") {
          if (args[1] != null) {
            drunkerstatus.url = args[1];
            //Validate the the URL here
          } else {
            message.author.send("Hey! You need to set the URL for the livestream!")
            break;
          }
          db.run("INSERT INTO boxes (state, host, hostid, hostpic, url, starttime) VALUES (1, \'" + message.author.username + "#" + message.author.discriminator + "\', \'" + message.author.id + "\', " + message.author.displayAvatarURL + "\', " + moment().unix() + ");");
          logger.verbose(message.author.username + " started a drunkerbox");
          //This should be "WHERE serverid = $currentServerID"
          message.channel.send(message.guild.roles.get(db.each("SELECT alertroleID FROM config WHERE serverid = " + message.guild.id + ";", function(err, results) {
            return results
          })).toString() + "\n" + message.author + " started a drunkerbox!");
          message.member.addRole(config.dbHostRoleID).catch(console.error);
          logger.debug(JSON.stringify(drunkerstatus));
        } else {
          logger.verbose("Stream is already active.");
        }

        break;

        /*
        ███████ ████████  ██████  ██████
        ██         ██    ██    ██ ██   ██
        ███████    ██    ██    ██ ██████
             ██    ██    ██    ██ ██
        ███████    ██     ██████  ██
        */

      case 'stop':
        if (drunkerstatus.state) {
          if (message.member.roles.has(config.serverModID) || drunkerstatus.hostid == message.author.id) {
            drunkerstatus.state = false;

            // console.log(message.member.nickname + " stopped the drunkerbox");
            logger.verbose(message.author.username + " stopped the drunkerbox");
            drunkerstatus.stoptime = moment().unix();
            if (dbdbase.dboxes == null) {
              dbdbase.dboxes = [drunkerstatus];
            } else {
              dbdbase.dboxes[dbdbase.dboxes.length] = drunkerstatus;
            }
            fs.writeFile(dbDataFile, JSON.stringify(dbdbase), 'utf8', (err) => { // Save this change to the file
              if (err) {
                logger.error(err);
              } else {
                // Let the user know if it succeeded
                logger.verbose("Saved to database.");
              }
            });

            message.channel.send(message.author + " stopped the drunkerbox");
            message.member.removeRole(config.dbHostRoleID).catch(console.error);
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

        /*
        ███████ ████████  █████  ████████ ██    ██ ███████
        ██         ██    ██   ██    ██    ██    ██ ██
        ███████    ██    ███████    ██    ██    ██ ███████
             ██    ██    ██   ██    ██    ██    ██      ██
        ███████    ██    ██   ██    ██     ██████  ███████
        */

      case 'status':
        var embed = new Discord.RichEmbed()
        if (drunkerstatus.state == true) {
          var statusdesc = "Host: " + drunkerstatus.host + "\n Time started: " + moment.unix(drunkerstatus.starttime).format("MMM DD, hh:mm");
          embed.setImage(drunkerstatus.hostpic);
          if (drunkerstatus.url != "none")
            statusdesc += "\n Link: " + drunkerstatus.url;
        } else {
          var statusdesc = "No drunkerbox is currently live";
        }
        embed.addField("Drunkerbox Status", statusdesc);
        message.channel.send({
          embed
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
          }
          var embed = new Discord.RichEmbed()
          var statusdesc = "Updoots: " + (results[0].updootcount / dootee_bonus) + "\nDowndoots: " + (results[0].downdootcount / dootee_bonus) + "\nBalance: " + parseInt((results[0].updootcount / (results[0].updootcount + results[0].downdootcount)) * 100) + "%";
          embed.addField( karmauser.username + "#" + karmauser.discriminator + "\nKarma Score:", statusdesc);
          message.channel.send({
            embed
          });
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

/*
██     ██ ███████ ██████      ██████   █████   ██████  ███████
██     ██ ██      ██   ██     ██   ██ ██   ██ ██       ██
██  █  ██ █████   ██████      ██████  ███████ ██   ███ █████
██ ███ ██ ██      ██   ██     ██      ██   ██ ██    ██ ██
 ███ ███  ███████ ██████      ██      ██   ██  ██████  ███████
*/

// on the request to root (localhost:3000/)
app.get('/', function(req, res) {
  fs.readFile(dbDataFile, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    dbdbase = JSON.parse(data);
  });
  res.render('index', {
    drunkerstatus: drunkerstatus,
    dboxes: dbdbase.dboxes
  });
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

// start the server in the port 3000 !
app.listen(PORT, function() {
  logger.verbose('Listening on port ' + PORT + '.');
});
