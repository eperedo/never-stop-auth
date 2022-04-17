// En @platzi no solo tienes acceso a cursos, tambien a una gran comunidad.
// Se parte de ella ayudando a {username} en los foros
// https://platzi.com/comment/3553866/

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

async function getForumQuestion() {
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
	await page.goto(`${BASE_URL}/foro`, {
		timeout: 0,
		waitUntil: 'networkidle2',
	});

	const discussions = await page.evaluate(() => {
		// forumDiscussions info does not exist
		if (!window.initialState && !window.initialState.forumDiscussions) {
			return null;
		}

		return window.initialState.forumDiscussions.discussions;
	});

	const withouResponses = discussions.filter((d) => d.responses === 0);
	let discussion =
		withouResponses[Math.ceil(Math.random() * (withouResponses.length - 1))];
	if (!discussion) {
		return {
			message: 'No discussion with 0 responses',
		};
	}

	const el = await page.$(`[href="${discussion.url}"]`);
	const img = await el.screenshot({ encoding: 'base64' });
	const cd = new Date();
	const fileName = cd.toISOString().replace(/:/g, '-').replace('.', '-');

	uploadAndTweet({ img, fileName, discussion });
	await page.close();

	return {
		discussion,
		discussions: withouResponses,
	};
}

async function uploadAndTweet({ fileName, img, discussion }) {
	const imageParams = {
		Bucket: 'botzi',
		Key: `forum-help/${fileName}.png`,
		ContentType: 'image/png',
		ContentEncoding: 'base64',
		Body: Buffer.from(img, 'base64'),
		ACL: 'public-read',
	};
	await uploadImage(imageParams);
	await postToTweet(
		img,
		`En @platzi no solo tienes acceso a cursos, tambien a una gran comunidad.
	  Se parte de ella ayudando a ${discussion.author.username} en los foros. ${BASE_URL}${discussion.url}`,
	);
}

module.exports = getForumQuestion;
