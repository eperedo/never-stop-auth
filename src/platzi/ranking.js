const BASE_URL = 'https://platzi.com';

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const UA = require('user-agents');
const { uploadImage } = require('../utils/aws');
const postToTweet = require('../utils/tweet');

function getPeruDate(date1) {
	const options1 = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	};

	date1.setHours(date1.getHours() - 5);
	const dateTimeFormat1 = new Intl.DateTimeFormat('es-PE', options1);
	return dateTimeFormat1.format(date1);
}

async function getRankingInformation() {
	const browser = await puppeteer.launch({
		args: chromium.args,
		executablePath: process.env.P_PATH || (await chromium.executablePath),
		headless: true,
	});

	const page = await browser.newPage();
	let userAgent = new UA();
	await page.setUserAgent(userAgent.toString());
	await page.setViewport({
		width: 1024,
		height: 841,
		deviceScaleFactor: 1,
	});
	await page.goto(`${BASE_URL}/foro`, { waitUntil: 'networkidle2' });

	const studentInfo = await page.evaluate(() => {
		// Student info does not exist
		if (!window.initialState && !window.initialState.outstandingStudents) {
			return null;
		}

		return window.initialState.outstandingStudents;
	});

	const el = await page.$('div.OutstandingStudents');
	const img = await el.screenshot({ encoding: 'base64' });
	const cd = new Date();
	const fileName = cd.toISOString().replace(/:/g, '-').replace('.', '-');

	const imageParams = {
		Bucket: 'botzi',
		Key: `ranking/${fileName}.png`,
		ContentType: 'image/png',
		ContentEncoding: 'base64',
		Body: Buffer.from(img, 'base64'),
		ACL: 'public-read',
	};

	const s3Result = await uploadImage(imageParams);

	await postToTweet(
		img,
		`¡Felicitaciones a ${studentInfo[0].username} por tener el mayor rank del día en @platzi! Mira la lista completa en: ${BASE_URL}/foro #nuncaparesdeaprender`,
	);
	await page.close();

	return {
		students: studentInfo,
		urlImage: s3Result.Location,
		createdAt: cd.toISOString(),
		date: getPeruDate(cd),
	};
}

module.exports = getRankingInformation;
