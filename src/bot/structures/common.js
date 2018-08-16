async function handleError(msg, e) {
	if (e.message === 'timeout') {
		return msg.channel.createMessage('Timed out waiting for your answer.');
	}
	if (e.message === 'privacy') {
		return msg.channel.createMessage('You have to agree to our privacy policy to be able to use our service.');
	}
	return msg.channel.createMessage('An error occured while trying to create your user');
}

module.exports = { handleError };
