const Discord = require('discord.js'); //Load Discord library and create a new client
const fs = require('fs');
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const db = new sqlite3.Database('data/botbase.db');
const {
    createCanvas,
    loadImage
} = require('canvas');

//Custom Modules
const logger = require('../modules/log.js');

//TODO: MAKE SURE THESE ARE ALSO CHANGED IN MESSAGES.JS
const TIMERRESET = 15; // Number of seconds before getting more exp
const LEVELMULTIPLIER = 100; // You need this much experience * your current level to level up
const MAXEXPGAIN = 5; // Each time you gain exp, it's between 0 and this number
const EXPMULTIPLIER = 5; // Then it's multiplied by this number


function barwidth(floor, ceiling, current, barWidthMax) {
    var cX = current - floor; //Current level experience
    var nX = ceiling - floor; //neeeded experience to level
    var pC = cX / nX; //percent of level completed
    var cbW = pC * barWidthMax; //current Bar Width
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
function makeGRD(Re, Ge, Be, L2R, T2B, canvasObj) {
    var grd = canvasObj.createLinearGradient(0, 0, L2R, T2B);
    grd.addColorStop(0, 'rgba(' + Math.round(Re / 2) + ',' + Math.round(Ge / 2) + ',' + Math.round(Be / 2) + ',1)');
    grd.addColorStop(1, 'rgba(' + Re + ',' + Ge + ',' + Be + ',1)');

    return grd;
}

exports.run = (discordClient, message, args) => {
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
                users.newuser(whoisuser, whoismember);
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

                const userColor = hexToRgb(whoismember.displayHexColor);

                if (results.pcbg_url == undefined) {
                    var playerCard_source = __dirname + '/../data/playercards/pc_def_hwf.png';
                } else {
                    var playerCard_source = results.pcbg_url;
                }

                loadImage(playerCard_source).then((playercardimg) => {
                    //Draw the playercard background
                    ctx.drawImage(playercardimg, 0, 0, 250, 100);
                    loadImage(__dirname + '/../data/playercards/frame.png').then((frameimg) => {
                        ctx.drawImage(frameimg, 0, 0, 250, 100);
                        // Draw XP bar
                        ctx.fillStyle = makeGRD(userColor.r, userColor.g, userColor.b, barwidth(minL, expCount, results.exp, bW), 0, ctx); // Highest role color
                        ctx.fillRect(bX, bY + 1, barwidth(minL, expCount, results.exp, bW), bH); // draw bar
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
                        ctx.fillStyle = makeGRD(255, 68, 0, barwidth(0, parseInt(results.updoots + results.updooty + results.downdoots + results.downdooty), parseInt(results.updoots + results.updooty), bW), 0, ctx);
                        ctx.fillRect(bX, bY + 15, barwidth(0, parseInt(results.updoots + results.updooty + results.downdoots + results.downdooty), parseInt(results.updoots + results.updooty), bW), 8);
                        loadImage(whoisuser.avatarURL).then((avatarimg) => {
                            ctx.drawImage(avatarimg, 11, 11, 32, 32);
                            const out = fs.createWriteStream(__dirname + '/../data/tempCard.png');
                            const stream = canvas.createPNGStream();
                            stream.pipe(out);
                            out.on('finish', () => {
                                const attachment = new Discord.Attachment(__dirname + '/../data/tempCard.png', 'tempCard.png');
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
}
