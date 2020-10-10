const moment = require('moment');
const { createLogger, format, transports } = require('winston');
const { combine, splat, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
	let completeMessage = `${timestamp} [${level}] : ${message} `;

	if (metadata) {
		completeMessage += JSON.stringify(metadata);
	}

	return completeMessage;
});

const logger = createLogger({
	format: combine(format.colorize(), splat(), timestamp(), logFormat),
	transports: [new transports.Console()],
	timestamp: function () {
		return moment().format('YYYY-MM-DD HH:mm:ss');
	},
	colorize: true
});

module.exports = logger;
