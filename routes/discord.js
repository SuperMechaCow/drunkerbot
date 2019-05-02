const express = require('express');
const discord_route = express.Router();
const fetch = require('node-fetch');
const btoa = require('btoa');
const {
    catchAsync
} = require('../modules/utils');

const app = express();
app.use('/', require('../routes/web_routes'));

const config = require('../modules/config.js');

//THE CORRECT WAY
const CLIENT_ID = config.CLIENT_ID;
const CLIENT_SECRET = config.CLIENT_SECRET;

// const CLIENT_ID = "517521443869687818";
// const CLIENT_SECRET = "Ofp0DLSNt9k21JEM5-nRVCSKPYgfO2C0";

const redirect = encodeURIComponent('http://localhost:3000/api/discord/callback');

discord_route.get('/login', (req, res) => {
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`);
    // res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=517521443869687818&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code&scope=identify`);
});

discord_route.get('/callback', catchAsync(async (req, res) => {
    if (!req.query.code) {
        //throw new Error('NoCodeProvided');
        res.redirect(`/`);
    }
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    //console.log("CREDS:\n");
    //console.log(creds);

    const response = await fetch('https://discordapp.com/api/oauth2/token?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&grant_type=authorization_code&redirect_uri=' + redirect + '&code=' + code + '&scope=identify%20guilds', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${creds}`,
        },
    });

    const json = await response.json();

    res.redirect(`/login/?token=${json.access_token}`);

}));

module.exports = discord_route;
