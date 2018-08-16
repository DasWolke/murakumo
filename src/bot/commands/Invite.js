const Command = require('../Command');
const defaults = { uses: 1, validity: 0, channel: '345898350333263882' };
const idRegex = /[0-9]{17,19}/;

class Invite extends Command {
	constructor(bot) {
		super('invite', bot);
	}

	async exec(msg, args) {
		if (msg.author.id !== '128392910574977024') {
			return msg.channel.createMessage('no u');
		}
		let uses = defaults.uses;
		let validity = defaults.validity;
		let channel = defaults.channel;
		if (args.length === 1) {
			uses = args[0];
		} else if (args.length > 1) {
			uses = Invite._parseUses(args[0]);
			validity = Invite._parseValidity(args[1]);
			channel = Invite._parseChannel(args[2], msg);
		}
		let invite;
		try {
			invite = await this.bot.createChannelInvite(channel, {
				maxAge: validity,
				maxUses: uses,
				unique: true,
			}, `Invite created by ${msg.author.username}#${msg.author.discriminator}`);
		} catch (e) {
			return msg.channel.createMessage('<a:ablobcatmegasip:446624772244373504> Missing Permissions to create invite');
		}
		const dmChannel = await msg.author.getDMChannel();
		await dmChannel.createMessage(`https://discord.gg/${invite.code}`);
		return msg.channel.createMessage(Invite._createResponseMessage(channel, validity, uses));
	}

	static _createResponseMessage(channel, validity, uses) {
		const pluralTimes = uses === 1 ? 'once' : `up to ${uses} times`;
		const pluralValidity = validity === 0 ? 'forever' : `for ${validity} days`;
		return `Created an invite for channel <#${channel}> that is valid ${pluralValidity} and can be used ${pluralTimes}`;
	}

	static _parseUses(uses) {
		if (typeof uses === 'number') {
			return uses;
		}
		switch (uses) {
			case 'single':
				return 1;
			case 'double':
				return 2;
			case 'tripple':
				return 3;
			case 'ten':
				return 10;
			default:
				break;
		}
		return defaults.uses;
	}

	static _parseValidity(validity) {
		if (typeof validity === 'number') {
			return validity;
		}
		switch (validity) {
			case 'unlimited':
				return 0;
			case '1day':
				return 86400;
			case '1week':
				return 86400 * 7;
			default:
				break;
		}
		return defaults.validity;
	}

	static _parseChannel(channel, msg) {
		if (!channel) {
			return defaults.channel;
		}
		if (channel.startsWith('<#') && channel.endsWith('>')) {
			channel = channel.substring(2, channel.length - 1);
		}
		if (idRegex.test(channel)) {
			if (msg.channel.guild.channels.has(channel)) {
				return channel;
			}
		}
		return defaults.channel;
	}
}

module.exports = Invite;
