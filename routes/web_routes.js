const Discord = require('discord.js'); //Load Discord library and create a new client
const express = require('express');
const app = express();
const expressRouter = express.Router();
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

// const session = require('express-session');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');
const config = require('../modules/config.js');
const grabapi = require('../modules/grabapi.js');

let route = '/';

expressRouter.get('/steamgame', function(req, res) {
    res.redirect(`steam://connect/${req.query.ip}:${req.query.port}`);
});

expressRouter.get('/', function(req, res) {
    res.render('index');
});

expressRouter.get('/login', function(req, res) {

    if (req.query.token != 'undefined') {
        // res.header('Set-Cookie', 'authtoken=' + req.query.token);
        req.session.authtoken = req.query.token;
        res.redirect('/panel');
        return;
    } else {
        res.render('oops', {
            message: 'No OAuth token provided!'
        })
    }

});

expressRouter.get('/panel', function(req, res) {

    if (res.locals.userstuff) {
        db.all("SELECT * FROM t_guilds LEFT OUTER JOIN t_users ON t_guilds.guildDID = t_users.guildDID WHERE t_users.userDID = \'" + res.locals.userstuff.id + "\';", function(err, results) {
            if (err) {
                logger.error(err);
            } else {
                res.render('panel', {
                    botstuff: res.locals.botstuff,
                    userstuff: res.locals.userstuff,
                    t_guilds: results
                });
            }
        });
    } else {
        res.render('oops', {
            message: 'You need to log in first!'
        })
    }
});

//TODO: Check to make sure the user or guild exists before trying to retrieve info

expressRouter.get('/guild/:guildDID', function(req, res) {
    db.get("SELECT * FROM t_guilds WHERE t_guilds.guildDID = \'" + req.params.guildDID + "\';", function(err, results) {
        //This line is just for testing purposes
        // console.log(discordClient.guilds.find(guild => guild.id === req.params.guildDID));
        if (err) {
            logger.error(err);
        } else {
            if (results != undefined) {
                var guildFound;
                grabapi('Bearer', req.session.authtoken, '/users/@me/guilds').then(guildstuff => {
                    if (guildstuff.code == undefined) {
                        guildFound = guildstuff.find(guildsAPI => guildsAPI.id == req.params.guildDID);
                    }
                    res.render('guild', {
                        botstuff: res.locals.botstuff,
                        userstuff: res.locals.userstuff,
                        guildFound: guildFound,
                        t_guilds: results
                    });
                });
            } else {
                res.render('oops', {
                    message: 'Couldn\'t find that guild!'
                })
            }
        }
    });
});

expressRouter.get('/guild/:guildDID/stream', function(req, res) {
    db.all("SELECT * FROM t_guilds LEFT OUTER JOIN t_events ON t_guilds.guildDID = t_events.guildDID WHERE t_guilds.guildDID = \'" + req.params.guildDID + "\';", function(err, results) {
        if (err) {
            logger.error(err);
        } else {
            if (!results.find(endtime => endtime.start == null)) {

                const getStreamMeta = new Promise((resolve, reject) => {
                    results.forEach(function(item, index) {
                        grabapi('Bot', config.BOTSECRET, '/users/' + item.userDID).then(hoststuff => {
                            results[index] = Object.assign(results[index], hoststuff);
                            if (index === results.length - 1) resolve();
                        });
                    });
                })

                getStreamMeta.then(() => {
                    const stream_live = results.find(endtime => endtime.end == null);
                    res.render('stream', {
                        botstuff: res.locals.botstuff,
                        userstuff: res.locals.userstuff,
                        stream_live: stream_live,
                        guildstreams: results
                    });
                });
            } else {
                res.render('oops', {
                    message: 'Couldn\'t find any streams for this guild'
                })
            }
        }
    });
});

expressRouter.get('/guild/:guildDID/top10', function(req, res) {
    db.all("SELECT * FROM t_guilds LEFT OUTER JOIN t_users ON t_guilds.guildDID = t_users.guildDID WHERE t_users.guildDID = \'" + req.params.guildDID + "\' ORDER BY message_count DESC LIMIT 10;", function(err, results) {
        if (err) {
            logger.error(err);
        } else {
            if (results == "") {
                res.render('oops', {
                    message: 'Couldn\'t find any users for this guild'
                })
            } else {
                res.render('top10', {
                    botstuff: res.locals.botstuff,
                    userstuff: res.locals.userstuff,
                    top10: results
                });
            }
        }
    });
});

expressRouter.get('/guild/:guildDID/top10/:channelDID', function(req, res) {
    db.all("SELECT * FROM t_messages WHERE channelDID = \'" + req.params.channelDID + "\' AND guildDID = \'" + req.params.guildDID + "\' ORDER BY message_count DESC LIMIT 10;", function(err, results) {
        if (err) {
            logger.error(err);
        } else {
            if (results == "") {
                res.render('oops', {
                    message: 'Couldn\'t find any users for this channel'
                });
            } else {
                res.render('top10', {
                    botstuff: res.locals.botstuff,
                    userstuff: res.locals.userstuff,
                    top10: results
                });
            }
        }
    });
});

expressRouter.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = {expressRouter, route};
