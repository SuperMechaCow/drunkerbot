const fs = require('fs');
const https = require('https');
const webp = require('webp-converter');

const avatarFile = fs.createWriteStream(__dirname + '/data/avatarFile.webp');
const request = https.get('https://cdn.discordapp.com/avatars/99694104471932928/cb6035ec0252f4391c934f3a55d2aa4f.webp', function(response) {
	response.pipe(avatarFile);
    console.log(__dirname);
	webp.dwebp(__dirname + '/data/avatarFile.webp', __dirname + '/data/avatarFile.png', '-o', function(status, error) {
        if (error) {
            console.log(error);
        } else {
            console.log(status);
        }
    });
});
