const Twitter = require('twitter');

const client = new Twitter({
	consumer_key: process.env.TW_BOTZI_API_KEY,
	consumer_secret: process.env.TW_BOTZI_API_SECRET_KEY,
	access_token_key: process.env.TW_BOTZI_ACCESS_TOKEN,
	access_token_secret: process.env.TW_BOTZI_ACCESS_TOKEN_SECRET,
});

async function postToTweet(image, status) {
	try {
		const resMedia = await client.post('media/upload', {
			media: Buffer.from(image, 'base64'),
		});

		const newTweet = {
			status,
			media_ids: resMedia.media_id_string,
		};
		const resTweet = await client.post('statuses/update', newTweet);
		return resTweet;
	} catch (error) {
		console.log('Error', error);
	}
}

module.exports = postToTweet;
