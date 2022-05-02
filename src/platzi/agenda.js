const BASE_URL = 'https://platzi.com';

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const UA = require('user-agents');
const { uploadImage } = require('../utils/aws');
const postToTweet = require('../utils/tweet');

async function getAgenda() {
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
	await page.goto(`${BASE_URL}/agenda`, {
		timeout: 0,
		waitUntil: 'networkidle2',
	});

	const el = await page.$('section#calendar');
	const img = await el.screenshot({ encoding: 'base64' });
	const cd = new Date();
	const fileName = cd.toISOString().replace(/:/g, '-').replace('.', '-');

	uploadAndTweet({ img, fileName });
	await page.close();
	await browser.close();

	return {
		agenda: new Date(),
	};
}

async function uploadAndTweet({ fileName, img }) {
	const imageParams = {
		Bucket: 'botzi',
		Key: `agenda/${fileName}.png`,
		ContentType: 'image/png',
		ContentEncoding: 'base64',
		Body: Buffer.from(img, 'base64'),
		ACL: 'public-read',
	};

	await uploadImage(imageParams);
	await postToTweet(
		img,
		`Estos son algunos de los cursos que llegan a @platzi esta semana ¿Cual es el que esperabas? 🥳 Ve la lista completa en ${BASE_URL}/agenda #nuncaparesdeaprender`,
	);
}

module.exports = getAgenda;
