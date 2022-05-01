const BASE_URL = 'https://platzi.com';

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const UA = require('user-agents');
const { uploadImage } = require('../utils/aws');
const postToTweet = require('../utils/tweet');

async function getAgenda() {
	const currentDate = new Date().getDay();

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

	const agenda = await page.evaluate(() => {
		const agendaItems = window.data.scheduleItems.agenda_all.agenda_items;
		return agendaItems;
	});

	return {
		...agenda,
		currentDate,
	};

	// const withouResponses = discussions.filter((d) => d.responses === 0);
	// let discussion =
	// 	withouResponses[Math.ceil(Math.random() * (withouResponses.length - 1))];
	// if (!discussion) {
	// 	return {
	// 		message: 'No discussion with 0 responses',
	// 	};
	// }

	// const el = await page.$(`[href="${discussion.url}"]`);
	// const img = await el.screenshot({ encoding: 'base64' });
	// const cd = new Date();
	// const fileName = cd.toISOString().replace(/:/g, '-').replace('.', '-');

	// uploadAndTweet({ category, discussion, img, fileName });
	// await page.close();
	// await browser.close();

	// return {
	// 	discussion,
	// 	discussions: withouResponses,
	// };
}

async function uploadAndTweet({ category, discussion, fileName, img }) {
	const imageParams = {
		Bucket: 'botzi',
		Key: `forum-help/${fileName}.png`,
		ContentType: 'image/png',
		ContentEncoding: 'base64',
		Body: Buffer.from(img, 'base64'),
		ACL: 'public-read',
	};
	// ¡Hoy es ${category.dayName} de ${category.name}! Se parte de la comunidad de @platzi
	// ayudando a {username} en los foros. ${BASE_URL}${discussion.url}
	await uploadImage(imageParams);
	await postToTweet(
		img,
		`¡Hoy es ${category.dayName} de ${category.name}! Se parte de la comunidad de @platzi ayudando a ${discussion.author.username} en los foros. ${BASE_URL}${discussion.url} #nuncaparesdeaprender`,
	);
}

/* 
`En @platzi no solo tienes acceso a cursos, tambien a una gran comunidad.
Se parte de ella ayudando a ${discussion.author.username} en los foros. ${BASE_URL}${discussion.url}`
*/

module.exports = getAgenda;
