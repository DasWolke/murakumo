const MessageListener = require('./MessageListener');

class MessageListenConnector {
	constructor() {
		this.listeners = {};
	}

	addListener(channelID, opts) {
		const id = `${channelID}_${Date.now()}`;
		const listener = new MessageListener(channelID, opts);
		listener.once('stop', () => {
			delete this.listeners[id];
		});
		this.listeners[id] = listener;
		return listener;
	}

	triggerAllListeners(message, bot) {
		for (const key in this.listeners) {
			// eslint-disable-next-line no-prototype-builtins
			if (this.listeners.hasOwnProperty(key)) {
				if (key.startsWith(message.channel.id + '_')) {
					this.listeners[key].check(message, bot);
				}
			}
		}
	}
}

module.exports = MessageListenConnector;
