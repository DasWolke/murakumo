const Command = require('../Command');
const defaultScopes = ['toph-staging:image_data', 'toph-production:image_data'];
const WeebSDK = require('../structures/WeebSDK');
const common = require('../structures/common');

class RegisterUser extends Command {
	constructor(bot, customConfig) {
		super('register', bot);
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
		if (activeUsers.length > 0) {
			return msg.channel.createMessage('You already own a weeb.sh user');
		}
		return this._startRegistrationProcess(msg, msg.author);
	}

	async _startRegistrationProcess(msg, user) {
		let username;
		try {
			username = await this._fetchUsername(msg, user.username);
			await this._agreeToPolicy(msg);
		} catch (e) {
			return common.handleError(msg, e);
		}
		const weebUser = this._buildWeebUser(username, user.id);
		const accountData = await this._weebSdk.createAccount(weebUser);
		const successMsg = `You now have a weeb.sh account with the following data:
		Name: \`${accountData.name}\`
		ID: \`${accountData.id}\``;
		return msg.channel.createMessage(successMsg);
	}

	_agreeToPolicy(msg) {
		return new Promise((resolve, reject) => {
			msg.channel.createMessage(`Please agree with our privacy policy (<${this._customConfig.privacyPolicyUrl}>) by typing \`yes\``)
				.then(() => {
					const listener = msg.messageListenConnector.addListener(msg.channel.id, {
						max: 1,
						timeout: 10000,
						filter: listMsg => listMsg.author.id === msg.author.id,
					});
					listener.once('message', msg => {
						if (msg.content !== 'yes') {
							return reject(new Error('privacy'));
						}
						resolve(true);
					});
					listener.once('timeout', () => {
						reject(new Error('timeout'));
					});
				});
		});
	}

	_fetchUsername(msg, username) {
		return new Promise((resolve, reject) => {
			if (this._isValidName(username)) {
				return resolve(username.toLocaleLowerCase()
					.trim());
			}
			msg.channel.createMessage(this._generateInvalidUsernameMessage(username))
				.then(() => {
					const listener = msg.messageListenConnector.addListener(msg.channel.id, {
						max: 1,
						timeout: 10000,
						filter: listMsg => listMsg.author.id === msg.author.id,
					});
					listener.once('message', msg => {
						if (this._isValidName(msg.content)) {
							return resolve(msg.content.toLocaleLowerCase()
								.trim());
						}
						return resolve(this._fetchUsername(msg, msg.content));
					});
					listener.once('timeout', () => {
						reject(new Error('timeout'));
					});
				})
				.catch(e => reject(e));
		});
	}

	_buildWeebUser(username, id, scopes = defaultScopes) {
		return {
			name: username,
			discordUserId: id,
			active: true,
			scopes,
		};
	}

	_isValidName(name) {
		return /^[a-zA-Z0-9_]*$/.test(name);
	}

	_generateInvalidUsernameMessage(username) {
		// eslint-disable-next-line max-len
		return `Unfortunately the name \`${username}\` is not usable, please enter an ASCII Version of your name (Hint: use \`_\` instead of spaces)`;
	}
}

module.exports = RegisterUser;
