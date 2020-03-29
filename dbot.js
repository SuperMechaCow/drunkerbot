const Discord = require('discord.js'); //Load Discord library and create a new client
const discordClient = new Discord.Client();
const express = require('express'); //Express framework
const app = express();
const path = require('path'); //Express directory handling
const fs = require('fs'); //Interacting with filesystem
const Enmap = require("enmap");
const moment = require('moment'); //Handling datestamps and time formats
const bodyParser = require('body-parser'); //Parses data from http request bodies
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
const session = require('express-session');

//const urlExists = require('url-exists'); //Validates URLs
// var Snooper = require('reddit-snooper'); //Reddit wrapper and API library
// snooper = new Snooper({
//     // credential information is not needed for snooper.watcher
//     // username:
//     // password:
//     // app_id:
//     // api_secret:
//     //user_agent: 'drunkerbot',
//     automatic_retries: true, // automatically handles condition when reddit says 'you are doing this too much'
//     api_requests_per_minute: 60 // api requests will be spread out in order to play nicely with Reddit
// });

//Custom Modules
const config = require('./modules/config.js');
const settings = require('./modules/settings.js');
const logger = require('./modules/log.js');
const newuser = require('./modules/newuser.js');
const newsnoo = require('./modules/newsnoo.js');
const grabapi = require('./modules/grabapi.js');

/*
███████ ██   ██ ██████  ██████  ███████ ███████ ███████
██       ██ ██  ██   ██ ██   ██ ██      ██      ██
█████     ███   ██████  ██████  █████   ███████ ███████
██       ██ ██  ██      ██   ██ ██           ██      ██
███████ ██   ██ ██      ██   ██ ███████ ███████ ███████
*/

//Set up PUG view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//Set up bodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
//Set up web folders
app.use(express.static("public"));
//Set up session handler
app.use(session({
    secret: config.SESSION_SECRET,
    duration: 360000,
    activeDuration: 360000,
    resave: true,
    saveUninitialized: true
}));
//Set up user data retrieval while logged in
app.use((req, res, next) => {
    grabapi('Bot', config.BOTSECRET, '/users/@me').then(botstuff => {
        res.locals.botstuff = botstuff;
        if (req.session.authtoken) {
            grabapi('Bearer', req.session.authtoken, '/users/@me').then(userstuff => {
                res.locals.userstuff = userstuff;
                next();
            });
        } else {
            next();
        }
    });
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

// Routes
app.use('/api/discord', require('./routes/discord'));
app.use('/api/v1', require('./routes/api_routes'));
app.use('/', require('./routes/web_routes'));

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

// snooper.watcher.getCommentWatcher('hardwareflare').on('comment', function(comment) {
//     newsnoo(comment, 'comment');
// });
//
// snooper.watcher.getPostWatcher('hardwareflare').on('post', function(post) {
//     newsnoo(post, 'post');
// });

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
