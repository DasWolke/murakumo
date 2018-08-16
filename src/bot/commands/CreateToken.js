const Command = require('../Command');
const WeebSDK = require('../structures/WeebSDK');
const common = require('../structures/common');

class CreateToken extends Command {
	constructor(bot, customConfig) {
		super('token', bot);
		this._customConfig = customConfig;
		this._weebSdk = new WeebSDK(null, { iroh: this._customConfig.irohHost }, this._customConfig);
	}

	async exec(msg) {
		if (!this.bot.guilds.get(this._customConfig.guildId)
			.members
			.get(msg.author.id)) {
			return msg.channel.createMessage(`You are not a member of the guild ${this.bot.guilds.get(this._customConfig.guildId).name}!`);
		}
		let activeUsers = await this._weebSdk.fetchAccounts();
		activeUsers = activeUsers.filter(au => {
			return au.discordUserId === msg.author.id;
		});
		if (activeUsers.length === 0) {
			return msg.channel.createMessage(`You don't own a weeb.sh user, create one using \`${this._customConfig.prefix} register\``);
		}
		const user = activeUsers[0];
		if (user.tokens.length > 0) {
			try {
				await this._recreateToken(msg, user);
			} catch (e) {
				return common.handleError(msg, e);
			}
		} else {
			return this._createToken(msg, user);
		}
	}

	_recreateToken(msg, user) {
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line max-len
			const infoMsg = 'You already have an active token, do you want to recreate it [`yes`/`no`] ? **This will turn the old token invalid!**';
			msg.channel.createMessage(infoMsg)
				.then(() => {
					const listener = msg.messageListenConnector.addListener(msg.channel.id, {
						max: 1,
						timeout: 10000,
						filter: listMsg => listMsg.author.id === msg.author.id,
					});
					listener.once('message', msg => {
						if (msg.content === 'yes') {
							return resolve(this._createToken(msg, user));
						}
						return resolve(msg.channel.createMessage('Ok, I won\'t recreate your token.'));
					});
					listener.once('timeout', () => {
						return reject(new Error('timeout'));
					});
				})
				.catch(e => reject(e));
		});
	}

	async _createToken(msg, user) {
		const tokenData = await this._weebSdk.createToken(user.id);
		const channel = await msg.author.getDMChannel();
		if (channel.id !== msg.channel.id) {
			await msg.channel.createMessage('You can find your new token in your dms.');
		}
		return channel.createMessage(`Here's your Wolke Token: \`${tokenData.wolkeToken}\``);
	}
}

module.exports = CreateToken;
