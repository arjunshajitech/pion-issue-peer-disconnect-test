const puppeteer = require("puppeteer");

let pages = [];
let browsers = [];
let browserCount = 5;
let pageCount = 10;
let sleepTime = 500;
let url = "http://192.168.2.107:3000/"

function sleep(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
      "--no-sandbox",
      "--window-size=1280,720",
      `--unsafely-treat-insecure-origin-as-secure=${url}`
    ],
  });
  browsers.push(browser);
  return browser;
}

async function openPage(browser, browserNumber, pageNumber) {
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, {
      waitUntil: "networkidle0",
    });
    console.log(`Joined conference.`);
    pages.push(page);
  } catch (err) {
    console.error(`Error during test run: ${err}`);
  }
}

async function openBrowser(browserNumber) {
  try {
    const browser = await createBrowser();

    for (let j = 1; j <= pageCount; j++) {
      await openPage(browser, browserNumber, j);
      await sleep(sleepTime);
    }
  } catch (error) {
    console.error(`Error during test: ${error}`);
  }
}

function graceClose(signal) {
  console.log(`Received signal: ${signal}`);
  pages.forEach(async (page) => {
    await page.close();
  });
  browsers.forEach(async (browser) => {
    await browser.close();
  });
  process.exit(0);
}

process.on("SIGTERM", graceClose);
process.on("SIGINT", graceClose);

async function multiBrowserRun() {
  const browserPromises = [];

  for (let j = 1; j <= browserCount; j++) {
    console.log(`Starting test run ${j}`);
    browserPromises.push(openBrowser(j));
  }

  await Promise.all(browserPromises);
  console.log("All browsers have been started.");
}

multiBrowserRun();
