const puppeteer = require('puppeteer');

async function getStudentInformation(username) {
	const browser = await puppeteer.launch({
		headless: false,
		args: ['--start-maximized'],
	});
	const page = await browser.newPage();

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
