const axios = require('axios');

class WeebSDK {
	constructor(baseUrl, endpoints = {}, customConfig) {
		if (!baseUrl) {
			baseUrl = 'https://api.weeb.sh';
		}
		const defaultEndpoints = {
			iroh: `${baseUrl}/accounts`,
			toph: `${baseUrl}/images`,
		};
		this._customConfig = customConfig;
		this.endpoints = {};
		this.endpoints = Object.assign(this.endpoints, defaultEndpoints, endpoints);
	}

	async createAccount(weebUser) {
		const res = await axios({
			headers: { Authorization: this._customConfig.weebShToken },
			url: `${this._customConfig.irohHost}/user`,
			method: 'post',
			data: weebUser,
		});
		return res.data.account;
	}

	async fetchAccounts() {
		const res = await axios({
			headers: { Authorization: this._customConfig.weebShToken },
			url: `${this._customConfig.irohHost}/user`,
			method: 'get',
		});
		return res.data.accounts;
	}

	async createToken(id) {
		const res = await axios({
			headers: { Authorization: this._customConfig.weebShToken },
			url: `${this._customConfig.irohHost}/token`,
			method: 'post',
			data: { userId: id },
		});
		return res.data;
	}
}

module.exports = WeebSDK;
