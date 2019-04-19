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
        format.printf(info => `\(${info.timestamp}\) \[${info.level}\]: ${info.message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: './data/dbot.log'
        })
    ]
});

module.exports = logger;
