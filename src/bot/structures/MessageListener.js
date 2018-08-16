const EventEmitter = require('events').EventEmitter;

class MessageCollector extends EventEmitter {
	constructor(channelID, opts) {
		super();
		this.max = 1000;
		this.filter = () => {
			return true;
		};
		this.channelID = channelID;
		this.stopped = false;
		this.collected = new Map();
		this._stopTimeout = null;
		if (opts) {
			if (Object.prototype.hasOwnProperty.call(opts, 'timeout')) {
				this._stopTimeout = setTimeout(() => {
					this.stop(true);
				}, opts.timeout);
			}
			if (Object.prototype.hasOwnProperty.call(opts, 'max')) {
				this.max = opts.max;
			}
			if (Object.prototype.hasOwnProperty.call(opts, 'filter')) {
				this.filter = opts.filter;
			}
		}
		this.on('message', this.message);
	}

	message(msg) {
		this.max--;
		this.collected.set(msg.id, msg);
		if (this.max === 0) {
			this.stop();
		}
	}

	stop(byTimeout) {
		if (this._stopTimeout) {
			clearTimeout(this._stopTimeout);
		}
		if (byTimeout) {
			this.emit('timeout');
		}
		this.stopped = true;
		this.emit('end');
		this.removeAllListeners();
	}

	end() {
		this.stop();
	}

	check(msg, bot) {
		if (!this.stopped && this.filter(msg) && msg.author.id !== bot.user.id) {
			this.emit('message', msg);
		}
	}
}

module.exports = MessageCollector;
