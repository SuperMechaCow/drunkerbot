const Discord = require('discord.js'); //Load Discord library and create a new client
const fs = require('fs');
const moment = require('moment'); //Handling datestamps and time formats
const sqlite3 = require('sqlite3'); //Interfaces with sqlite3 database
const https = require('https');
const webp = require('webp-converter');
const db = new sqlite3.Database('data/botbase.db');
const {
	createCanvas,
	loadImage
} = require('canvas');

//Custom Modules
const logger = require('../modules/log.js');
const newuser = require('../modules/newuser.js');
const settings = require('../modules/settings.js');

exports.help = {
    description: "Display a user's Playercard, which shows information about their activity on this server.", // Information about this command
    usage: settings.prefix + "whois [@user] [250x100px image attachment]\r\n(Show your playercard, a mentioned user's playercard, or change your playercard background)", // How to use this command
    docs: "https://github.com/SuperMechaCow/drunkerbot/blob/master/commands/whois.js" // URL to more information about or the code for this command
}
//TODO: Deleting the message that uploaded the background image that will cause a crash

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
	const bW = 229;
	//Bar Height
	const bH = 8;
	//Bar position
	const bX = 10;
	const bY = 78;
	//Portrait position
	const portS = 64;
	const portX = 10;
	const portY = 9;

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
		db.run("UPDATE t_users SET pcbg_url = \'" + message.attachments.first().url + "\' WHERE userDID = \'" + message.author.id + "\' AND guildDID = \'" + message.guild.id + "\';");
		pc_reply += "I changed your background for you!";
		message.channel.send(pc_reply)
	} else if (args[0] === 'default') {
		db.run("UPDATE t_users SET pcbg_url = NULL WHERE userDID =  \'" + message.author.id + "\' AND guildDID = \'" + message.guild.id + "\';", function(error) {
			if (!error) {
				message.channel.send("I cleared your background for you!");
			} else {
				logger.error(error);
			}
		});
	} else {
		db.get("SELECT * FROM t_users WHERE userDID = \'" + whoisuser.id + "\'; AND guildDID = \'" + message.guild.id + "\'", function(err, results) {
			if (results == null) {
				logger.warn("Couldn't find that user");
				newuser(whoisuser, message.guild.id);
				if (message.mentions.users.size)
					message.channel.send(message.mentions.users.first() + " didn\'t have a profile so I made one without their permission. They'll thank me later.");
			} else {
				var levelCount = 0;
				var expCount = 0;
				//Minimum experience needed for this level
				var minL = 0;
				while (results.exp > expCount) {
					minL = expCount;
					levelCount++;
					expCount = expCount + (levelCount * settings.LEVELMULTIPLIER);
				}
				const {
					createCanvas,
					loadImage
				} = require('canvas');

				const canvas = createCanvas(canW, canH)
				const ctx = canvas.getContext('2d')

				const userColor = hexToRgb(whoismember.displayHexColor);

				if (results.pcbg_url == undefined) {
					var playerCard_source = __dirname + '/../data/playercards/frame.png';
				} else {
					var playerCard_source = results.pcbg_url;
				}

				loadImage(playerCard_source).then((playercardimg) => {
					//Draw the playercard background
					ctx.drawImage(playercardimg, 0, 0, canW, canH);
					loadImage(__dirname + '/../data/playercards/frame.png').then((frameimg) => {
						ctx.drawImage(frameimg, 0, 0, canW, canH);
						// Draw XP bar
						ctx.fillStyle = makeGRD(userColor.r, userColor.g, userColor.b, barwidth(minL, expCount, results.exp, bW), 0, ctx); // Highest role color
						ctx.fillRect(bX, bY + 1, barwidth(minL, expCount, results.exp, bW), bH); // draw bar
						// Start drawing text
						ctx.font = '18px Impact'
						ctx.fillStyle = 'rgba(' + userColor.r + ',' + userColor.g + ',' + userColor.b + ', 1)'; //User color
						ctx.fillText(whoisuser.username, portX + portS + 5, portY + 18); // User name
						ctx.font = '10px Impact'
						ctx.fillStyle = 'rgba(255,255,255,1)';
						ctx.fillText(results.exp + " of " + expCount, portX + portS + 5, portY + 29) // XP numerals
						// ctx.fillStyle = 'rgba(148,148,255,1)';
						// ctx.fillText(results.downdoots, 160, canH - 10) // downdoots
						ctx.textAlign = 'right'
						// ctx.fillStyle = 'rgba(255,68,0,1)';
						// ctx.fillText(results.updoots, 90, canH - 10) //updoots
						ctx.fillStyle = 'rgba(255,255,255,1)';
						//ctx.font = '10px Impact'
						ctx.fillText('level', canW - 10, bY - 40); //Level numeral
						ctx.font = '38px Impact';
						ctx.fillText(levelCount, canW - 10, bY - 8); //Level numeral
						ctx.fillStyle = makeGRD(255, 68, 0, barwidth(0, parseInt(results.updoots + results.updooty + results.downdoots + results.downdooty), parseInt(results.updoots + results.updooty), bW), 0, ctx);
						ctx.fillRect(bX, bY + 15, barwidth(0, parseInt(results.updoots + results.updooty + results.downdoots + results.downdooty), parseInt(results.updoots + results.updooty), bW), 8);

						//Just messin' with ideas for bars with rounded edges
						// ctx.strokeStyle = makeGRD(userColor.r, userColor.g, userColor.b, barwidth(minL, expCount, results.exp, bW), 0, ctx); // Highest role color
						// ctx.lineWidth = bH;
						// ctx.lineCap = 'round';
						// ctx.beginPath();
						// ctx.moveTo(bX, bY + (bH / 2));
						// ctx.lineTo(bX + barwidth(minL, expCount, results.exp, bW), bY + (bH /2));
						// ctx.stroke();

						//Just messin' with ideas for bars made from arcs
						// var cX = results.exp - minL; //Current level experience
						// var nX = expCount - minL; //neeeded experience to level
						// var pC = cX / nX; //percent of level completed
						// ctx.lineCap = 'round';
						// ctx.beginPath();
						// ctx.strokeStyle = 'rgba(0,0,0,1)';
						// ctx.lineWidth = bH + 4;
						// ctx.arc(125, 10, 25, 0, Math.PI);
						// ctx.stroke();
						// ctx.beginPath();
						// ctx.strokeStyle = 'rgba(100,100,100,1)';
						// ctx.lineWidth = bH;
						// ctx.arc(125, 10, 25, 0, Math.PI);
						// ctx.stroke();
						// ctx.beginPath();
						// ctx.strokeStyle = makeGRD(userColor.r, userColor.g, userColor.b, barwidth(minL, expCount, results.exp, bW), 0, ctx); // Highest role color
						// ctx.arc(125, 10, 25, 0, Math.PI * pC);
						// ctx.stroke();

						//Just messin' around with badges based on roles
						// const rollWidth = 16
						// const endPoint = portX + portS + 5 + (rollWidth / 2) + (whoismember.roles.size * rollWidth);
						// ctx.lineCap = 'round';
						// var rollerIndex = 0;
						// whoismember.roles.forEach(function(item, value) {
						//     rollerIndex++;
						//     if (item.name !== '@everyone') {
						//         var roleColor = hexToRgb(item.hexColor);
						//         ctx.lineWidth = 18;
						//         ctx.strokeStyle = 'rgba(0,0,0,1)';
						//         ctx.beginPath();
						//         ctx.moveTo(endPoint - ((rollerIndex - 1) * rollWidth), bY - 21);
						//         ctx.lineTo(endPoint - (rollerIndex * rollWidth), bY - 21);
						//         ctx.stroke();
						//         ctx.lineWidth = 16;
						//         ctx.strokeStyle = 'rgba(' + roleColor.r + ', ' + roleColor.g + ', ' + roleColor.b + ', 1)'; // role color
						//         ctx.beginPath();
						//         ctx.moveTo(endPoint - ((rollerIndex - 1) * rollWidth), bY - 21);
						//         ctx.lineTo(endPoint - (rollerIndex * rollWidth), bY - 21);
						//         ctx.stroke();
						//     }
						// });
						const avatarFile = fs.createWriteStream(__dirname + '/../data/avatarFile.webp');
						const request = https.get(whoisuser.avatarURL(), function(response) {
							response.pipe(avatarFile);
							avatarFile.on('finish', () => {
								webp.dwebp(__dirname + '/../data/avatarFile.webp', __dirname + '/../data/avatarFile.png', '-o', function(status, error) {
									if (error) {
										console.log(error);
									} else {
										loadImage(__dirname + '/../data/avatarFile.png').then((avatarimg) => {
											ctx.drawImage(avatarimg, portX, portY, portS, portS);
											const out = fs.createWriteStream(__dirname + '/../data/tempCard.png');
											const stream = canvas.createPNGStream();
											stream.pipe(out);
											out.on('finish', () => {
												const attachment = new Discord.MessageAttachment(__dirname + '/../data/tempCard.png', 'tempCard.png');
												const embed = new Discord.MessageEmbed()
													.setTitle(whoisuser.username + '\'s Exp/Level')
													.attachFiles([attachment])
													.setImage('attachment://tempCard.png')
												//.addField("Joined on: ", moment.unix(whoismember.joinedTimestamp).format('MM/DD/YY'));
												message.channel.send({
													embed
												});
											});
										});
									}
								});
							});
						});
					});
				});
			}
		});
	}
}
