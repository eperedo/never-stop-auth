const AWS = require('aws-sdk');

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_ID,
	secretAccessKey: process.env.AWS_ACCESS_SECRET,
});

function uploadImage(imageInfo) {
	const p = new Promise((resolve, reject) => {
		s3.upload(imageInfo, (err, data) => {
			if (err) {
				console.log('AWS ERR', err);
				return reject(err);
			} else {
				console.log('Upload Image', data);
				return resolve(data);
			}
		});
	});
	return p;
}

module.exports = {
	uploadImage,
};
