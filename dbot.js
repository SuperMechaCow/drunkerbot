const Discord = require('discord.js'); //Load Discord library and create a new client
const discordClient = new Discord.Client();
const express = require('express'); //Express framework
const app = express();
const path = require('path'); //Express directory handling
const fs = require('fs'); //Interacting with filesystem
const Enmap = require("enmap");
const moment = require('moment'); //Handling datestamps and time formats
const bodyParser = require('body-parser'); //Parses data from http request bodies
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
//const urlExists = require('url-exists'); //Validates URLs
var Snooper = require('reddit-snooper'); //Reddit wrapper and API library
snooper = new Snooper({
    // credential information is not needed for snooper.watcher
    // username:
    // password:
    // app_id:
    // api_secret:
    //user_agent: 'drunkerbot',
    automatic_retries: true, // automatically handles condition when reddit says 'you are doing this too much'
    api_requests_per_minute: 60 // api requests will be spread out in order to play nicely with Reddit
});

// Create a Snoostorm CommentStream with the specified options
// const RcommentClient = new Snoostorm.CommentStream(redditConfig);

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

//Custom Modules
const config = require('./modules/config.js');
const settings = require('./modules/settings.js');
const logger = require('./modules/log.js');
const newuser = require('./modules/newuser.js');
const newsnoo = require('./modules/newsnoo.js');

// Login from envar
discordClient.login(config.BOTSECRET);

// start the server in the port 3000 !
app.listen(config.PORT, function() {
    logger.verbose('Listening on port ' + config.PORT + '.');
});

/*
 ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████      ██   ██  █████  ███    ██ ██████  ██      ███████ ██████
██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██     ██   ██ ██   ██ ████   ██ ██   ██ ██      ██      ██   ██
██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██     ███████ ███████ ██ ██  ██ ██   ██ ██      █████   ██████
██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██     ██   ██ ██   ██ ██  ██ ██ ██   ██ ██      ██      ██   ██
 ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████      ██   ██ ██   ██ ██   ████ ██████  ███████ ███████ ██   ██
*/

// This loop reads the /events/ folder and attaches each event file to the appropriate event.
fs.readdir("./events/", (err, files) => {
    if (err) return logger.error(err);
    files.forEach(file => {
        // If the file is not a JS file, ignore it (thanks, Apple)
        if (!file.endsWith(".js")) return;
        // Load the event file itself
        const event = require('./events/' + file);
        // Get just the event name from the file name
        let eventName = file.split(".")[0];
        discordClient.on(eventName, event.bind(null, discordClient));
        delete require.cache[require.resolve('./events/' + file)];
    });
});

discordClient.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        // Load the command file itself
        let props = require(`./commands/${file}`);
        // Get just the command name from the file name
        let commandName = file.split(".")[0];
        //logger.verbose(`Attempting to load command ${commandName}`);
        // Here we simply store the whole thing in the command Enmap. We're not running it right now.
        discordClient.commands.set(commandName, props);
    });
});

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
        db.get("SELECT * FROM t_streams WHERE state = 1;", function(err, results) {
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
        db.get("SELECT * FROM t_streams WHERE state = 1;", function(err, results) {
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
        db.get("SELECT * FROM t_streams WHERE state = 1;", function(err, results) {
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
        db.all("SELECT * FROM  t_users ORDER BY updoots DESC LIMIT 10;", function(err, results) {
            if (results == "") {
                logger.error("Somehow, nobody has updoots");
                reject(); // reject
            } else {
                resolve(results); // fulfilled
            }
        });
    });

    var streamsPromise = new Promise(function(resolve, reject) {
        db.all("SELECT * FROM t_streams ORDER BY start DESC;", function(err, results) {
            if (results == "") {
                logger.error("Somehow, nobody has dboxed yet")
                resolve(results); // reject
            } else {
                resolve(results); // fulfilled
            }
        });
    });

    var dbotstatsPromise = new Promise(function(resolve, reject) {
        db.get("SELECT * FROM MESSAGES;", function(err, results) {
            if (results != undefined) {
                webhits = results.webhits;
                db.run("UPDATE  t_messages SET webhits = " + parseInt(results.webhits + 1) + ";");
                resolve(results);
            } else {
                logger.error("Um... No dbotstat table in database? Weird.")
                resolve(results);
            }
        });
    });

    var collectAndRespond = function() {
        Promise.all([statusPromise, streamsPromise, dootsPromise, dbotstatsPromise, userPromise]).then(function(values) {
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
