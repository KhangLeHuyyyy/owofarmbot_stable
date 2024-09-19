const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

const API_KEY = '74f7d20aa70cbc5be5d715de546d6951';

async function solveHCaptcha(page) {
    const url = page.url();
    
    const siteKey = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[src*="hcaptcha"]');
        if (iframe) {
            const urlParams = new URLSearchParams(new URL(iframe.src).search);
            return urlParams.get('sitekey');  // Extract the 'sitekey' parameter from iframe's src
        }
        return null;
    });

    if (!siteKey) {
        console.log('Cannot find any captcha...');
        return null;
    }

    console.log('Captcha found. Sitekey:', siteKey);

    const captchaId = await submitCaptchaTo2Captcha(siteKey, url);
    const captchaSolution = await getCaptchaSolution(captchaId);

    if (captchaSolution) {
        await page.evaluate((token) => {
            document.querySelector('[name="h-captcha-response"]').value = token;
        }, captchaSolution);
        console.log('hCaptcha solved and token injected.');
    } else {
        console.log('Failed to solve hCaptcha.');
    }
}

async function submitCaptchaTo2Captcha(siteKey, url) {
    const response = await fetch(`http://2captcha.com/in.php?key=${API_KEY}&method=hcaptcha&sitekey=${siteKey}&pageurl=${url}`, {
        method: 'POST'
    });

    const body = await response.text();
    if (body.startsWith('OK|')) {
        const captchaId = body.split('|')[1];
        console.log('Captcha submitted, awaiting solution...');
        return captchaId;
    } else {
        throw new Error('Error submitting captcha: ' + body);
    }
}

async function getCaptchaSolution(captchaId) {
    while (true) {
        await new Promise(res => setTimeout(res, 20000));

        const response = await fetch(`http://2captcha.com/res.php?key=${API_KEY}&action=get&id=${captchaId}`);
        const body = await response.text();

        if (body === 'CAPCHA_NOT_READY') {
            console.log('Captcha not solved yet, retrying...');
        } else if (body.startsWith('OK|')) {
            const token = body.split('|')[1];
            console.log('Captcha solved:', token);
            return token;
        } else {
            throw new Error('Error solving captcha: ' + body);
        }
    }
}

module.exports = {
    solveHCaptcha,
    submitCaptchaTo2Captcha,
    getCaptchaSolution
};
