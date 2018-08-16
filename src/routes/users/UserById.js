const Route = require('@weeb_services/wapi-core').Route;
const HTTPCodes = require('@weeb_services/wapi-core').Constants.HTTPCodes;

class UserById extends Route {
	constructor() {
		super('GET', '/users/:id');
	}

	async call(req) {
		const guild = req.bot.guilds.get(req.customConfig.guildId);
		const member = guild.members.find(m => m.user.id === req.params.id);
		if (!member) {
			return { status: HTTPCodes.NOT_FOUND };
		}
		const user = {
			fulluser: `${member.user.username}#${member.user.discriminator}`,
			username: member.user.username,
			discriminator: member.user.discriminator,
			id: member.user.id,
			bot: member.user.bot,
			avatar: member.user.avatarURL ? member.user.avatarURL : member.user.defaultAvatarURL,
		};
		return { status: HTTPCodes.OK, user };
	}
}

module.exports = UserById;
