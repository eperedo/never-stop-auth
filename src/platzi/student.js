// const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const UA = require('user-agents');

async function getStudentInformation(username) {
	// const browser = await puppeteer.launch({
	// 	headless: process.env.P_HEADLESS || false,
	// 	args: ['--start-maximized'],
	// });
	const browser = await puppeteer.launch({
		args: chromium.args,
		executablePath: process.env.P_PATH || (await chromium.executablePath),
		headless: true,
	});
	const page = await browser.newPage();
	let userAgent = new UA();
	await page.setUserAgent(userAgent.toString());
	await page.goto(`https://platzi.com/p/${username}`);

	page.on('console', (consoleObj) => console.log(consoleObj.text()));

	const student = await page.evaluate(() => {
		return window.data;
	});

	await page.close();

	await browser.close();

	return student;
}

// getStudentInformation('eperedo');
// getStudentInformation('DaneSanchz');

module.exports = getStudentInformation;
