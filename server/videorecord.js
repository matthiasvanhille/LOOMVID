const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    const recorder = new PuppeteerScreenRecorder(page);
    await page.goto('https://eyelet.io');
    await recorder.start('./video/simple.mp4'); // supports extension - mp4, avi, webm and mov
    await page.evaluate(() => {
        const interval = setInterval(() => {
            if (window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 100) {
                clearInterval(interval); // Clear the interval if the condition is met
            } else {
                window.scrollTo({ top: window.scrollY + window.innerHeight, behavior: 'smooth' });
            }
        }, 2000);
    })
    const timeout = setTimeout(async () => {
        await recorder.stop();
        await browser.close();
        clearTimeout(timeout);
    }, 10000)
})();
