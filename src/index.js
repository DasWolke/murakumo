const WeebAPI = require('@weeb_services/wapi-core').WeebAPI;
const Require = require('@weeb_services/wapi-core').Require;
const Middleware = require('@weeb_services/wapi-core/').Middleware;
const Util = require('@weeb_services/wapi-core').Util;
const winston = require('winston');
const Eris = require('eris');
const Router = require('@weeb_services/wapi-core').Router;
const UserRoutes = Require.recursive('src/routes/users');
const CommandHandler = require('./bot/CommandHandler');
Util.configureWinston(winston);

class Murakumo extends WeebAPI {
	constructor() {
		super();
		this.onError = this.onError.bind(this);
		this.bot = null;
		this.customConfig = null;
		this.commandHandler = new CommandHandler(this.onError);
	}

	async onLoad() {
		this.customConfig = await Require.asyncJSON('./config/custom.json');
	}

	async onLoaded() {
		this.customConfig.irohHost = this.get('irohHost');
		this.bot = new Eris(this.customConfig.token, this.customConfig.erisOptions);
		await this.commandHandler.init(this.bot, this.customConfig);
		this.bot.on('ready', () => {
			winston.info('Bot has successfully turned ready');
			this.bot.editStatus('online', { name: 'with Akio and Wolke', type: 0 });
		});
		this.bot.on('error', this.onError);
		this.bot.on('messageCreate', msg => {
			this.commandHandler.handle(msg);
		});
		this.bot.connect();
	}

	async registerMiddlewares(app) {
		new Middleware('Bot supplier', this.onError, req => {
			req.bot = this.bot;
		}).register(app);
		new Middleware('Custom config supplier', this.onError, req => {
			req.customConfig = this.customConfig;
		}).register(app);
	}

	async registerRouters(app) {
		new Router('Users', UserRoutes, this.onError).register(app);
	}

	async onInitialized() {
		// Called after everything is setup and started
	}
}

new Murakumo().init()
	.then(res => winston.info('Successfully initialized Murakumo'))
	.catch(e => console.error(e));
