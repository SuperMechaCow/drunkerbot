const express = require('express');
const api_routes = express.Router();

const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');

//Custom Modules
const logger = require('../modules/log.js');
const settings = require('../modules/settings.js');

api_routes.get('/bot', function(req, res) {
    res.set('Content-Type', 'application/json');
    db.get("SELECT * FROM t_botstats;", function(err, results) {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            if (results != undefined) {
                res.send(JSON.stringify(results));
            } else {
                res.send('undefined');
            }
        }
    });
});

api_routes.get('/guild', function(req, res) {
    res.set('Content-Type', 'application/json');
    db.get("SELECT guildDID FROM t_guilds;", function(err, results) {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            if (results != undefined) {
                res.send(JSON.stringify(results));
            } else {
                res.send('undefined');
            }
        }
    });
});

api_routes.get('/guild/:guildDID/users', function(req, res) {
    res.set('Content-Type', 'application/json');
    db.get("SELECT user_id, userDID, usernameDiscord FROM t_users WHERE guildDID = \'" + req.params.guildDID + "\';", function(err, results) {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            if (results != undefined) {
                res.send(JSON.stringify(results));
            } else {
                res.send('undefined');
            }
        }
    });
});

api_routes.get('/roll', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.send('{\"result\":' + (Math.round(Math.random() * (20 - 1) + 1)) + '}');
});

api_routes.get('/ping', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.send('{\"response\": \"Pong!\"}');
});

api_routes.get('/guild/:guildDID/top10', function(req, res) {
    res.set('Content-Type', 'application/json');
    db.all("SELECT user_id, userDID, usernameDiscord, message_count, updoots, updooty, downdoots, downdooty FROM t_users WHERE guildDID = \'" + req.params.guildDID + "\' ORDER BY message_count DESC LIMIT 10;", function(err, results) {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            if (results != undefined) {
                res.send(JSON.stringify(results));
            } else {
                res.send('undefined');
            }
        }
    });
});

api_routes.get('/guild/:guildDID/top10/:channelDID', function(req, res) {
    res.set('Content-Type', 'application/json');
    db.all("SELECT * FROM t_messages WHERE channelDID = \'" + req.params.channelDID + "\' AND guildDID = \'" + req.params.guildDID + "\' ORDER BY message_count DESC LIMIT 10;", function(err, results) {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            if (results != undefined) {
                res.send(JSON.stringify(results));
            } else {
                res.send('undefined');
            }
        }
    });
});

api_routes.get('/guild/:guildDID/status/', function(req, res) {
    res.set('Content-Type', 'application/json');
    db.get("SELECT * FROM t_events WHERE guildDID = \'" + req.params.guildDID + "\' AND end IS NULL;", function(err, results) {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            if (results != undefined) {
                res.send(JSON.stringify(results));
            } else {
                res.send(require('../modules/settings.js').defaultResults);
            }
        }
    });
});

api_routes.get('/guild/:guildDID/whois/:userDID', function(req, res) {
    res.set('Content-Type', 'application/json');
    db.get("SELECT * FROM t_users WHERE userDID = \'" + req.params.userDID + "\' AND guildDID = \'" + req.params.guildDID + "\';", function(err, results) {
        if (err) {
            logger.error(err)
            res.send(err);
        } else {
            if (results != undefined) {
                var levelCount = 0;
                var expCount = 0;
                //Minimum experience needed for this level
                var minL = 0;
                while (results.exp > expCount) {
                    minL = expCount;
                    levelCount++;
                    expCount = expCount + (levelCount * settings.LEVELMULTIPLIER);
                }
                var apireturn = {
                    'user_id': results.user_id,
                    'usernameDiscord': results.usernameDiscord,
                    'message_count': results.message_count,
                    'exp': results.exp,
                    'level': levelCount,
                    'min_exp': minL,
                    'max_exp': expCount,
                    'updoots': results.updoots,
                    'updooty': results.updooty,
                    'downdoots': results.downdoots,
                    'downdooty': results.downdooty,
                    'pcbg_url': results.pcbg_url
                }
                res.send(JSON.stringify(apireturn));
            } else {
                res.send('undefined');
            }
        }
    });
});

module.exports = api_routes;
