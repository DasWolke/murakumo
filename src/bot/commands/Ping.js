const Command = require('../Command');

class Ping extends Command {
	constructor(bot) {
		super('ping', bot);
	}

	async exec(msg) {
		const start = msg.timestamp;
		const sendedMsg = await msg.channel.createMessage('pong');
		const diff = (sendedMsg.timestamp - start);
		await sendedMsg.edit(`pong \`${diff}ms\``);
	}
}

module.exports = Ping;
