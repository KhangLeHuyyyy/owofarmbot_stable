const puppeteer = require('puppeteer');

async function discordLogin(token) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://discord.com/oauth2/authorize?response_type=code&redirect_uri=https%3A%2F%2Fowobot.com%2Fapi%2Fauth%2Fdiscord%2Fredirect&scope=identify%20guilds%20email%20guilds.members.read&client_id=408785106942164992', { waitUntil: 'networkidle2' });

    await page.evaluate((token) => {
        window.localStorage.setItem('token', `"${token}"`);
    }, token);

    await page.reload({ waitUntil: 'networkidle2' });

    await page.waitForSelector('button[type="submit"]');

    await page.click('button[type="submit"]');

    console.log("Logged in,i am ready to fuck some captcha uwu.");

    await browser.close();
}

module.exports = { discordLogin };
