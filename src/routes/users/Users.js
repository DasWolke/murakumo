const Route = require('@weeb_services/wapi-core').Route;
const HTTPCodes = require('@weeb_services/wapi-core').Constants.HTTPCodes;

class Users extends Route {
	constructor() {
		super('GET', '/users');
	}

	async call(req) {
		const guild = req.bot.guilds.get(req.customConfig.guildId);
		const users = guild.members.map(m => ({
			fulluser: `${m.user.username}#${m.user.discriminator}`,
			username: m.user.username,
			discriminator: m.user.discriminator,
			id: m.user.id,
			bot: m.user.bot,
			avatar: m.user.avatarURL ? m.user.avatarURL : m.user.defaultAvatarURL,
		}));
		return { status: HTTPCodes.OK, users };
	}
}

module.exports = Users;
