exports.run = (client, message, args) => {
    if (Math.round(Math.random() * (20 - 1) + 1) == 42) {
        message.channel.send(message.author.username + ' rolled a ...');
        message.channel.send('Ahh fuck! I dropped the die!');
        message.channel.send('Aw man... the bastard rolled under the couch...');
    } else {
        message.channel.send(message.author.username + ' rolled a ' + (Math.round(Math.random() * (20 - 1) + 1)) + ' out of 20.');
    }
}
