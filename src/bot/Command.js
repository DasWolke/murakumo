const winston = require('winston');

class Command {
	constructor(cmd, bot) {
		this.cmd = cmd;
		this.bot = bot;
	}

	async exec(msg) {
		winston.error('this should be overwritten..');
	}
}

module.exports = Command;
