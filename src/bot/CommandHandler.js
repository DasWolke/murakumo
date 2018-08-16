const Require = require('@weeb_services/wapi-core').Require;
const winston = require('winston');
const MessageListenConnector = require('./structures/MessageListenConnector');

class CommandHandler {
	constructor(onError) {
		this._onError = onError;
		this._bot = null;
		this._customConfig = null;
		this._commandClasses = Require.recursive('src/bot/commands');
		this.commands = {};
		this.messageListenConnector = new MessageListenConnector();
	}

	async init(bot, customConfig) {
		this._bot = bot;
		this._customConfig = customConfig;
		this._loadCommands();
		winston.info(`Initialized bot command handler with ${Object.keys(this.commands).length} commands`);
	}

	_loadCommands() {
		for (const CommandClass of this._commandClasses) {
			const command = new CommandClass(this._bot, this._customConfig);
			this.commands[command.cmd] = command;
		}
	}

	handle(msg) {
		if (!msg.author.bot) {
			this.messageListenConnector.triggerAllListeners(msg, this._bot);
			msg.messageListenConnector = this.messageListenConnector;
			if (msg.content.startsWith(this._customConfig.prefix)) {
				if (msg.content.charAt(this._customConfig.prefix.length) !== ' ') {
					return;
				}
				const cmd = msg.content.substr(this._customConfig.prefix.length + 1)
					.trim()
					.split(' ')[0]; // Bump prefix length by one to not execute cmds without space
				if (this.commands[cmd]) {
					const args = CommandHandler._getCommandArguments(msg, cmd);
					this.commands[cmd].exec(msg, args)
						.then()
						.catch(this._onError);
				}
			}
		}
	}

	static _getCommandArguments(msg, cmd) {
		const index = msg.content.split(' ')
			.indexOf(cmd);
		return msg.content.split(' ')
			.splice(index + 1);
	}
}

module.exports = CommandHandler;
