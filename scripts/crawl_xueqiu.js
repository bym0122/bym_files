const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const USER_ID = "9493911686";
const PROFILE_URL = `https://xueqiu.com/u/${USER_ID}`;

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 900
    }
  });

  try {
    console.log(`Opening: ${PROFILE_URL}`);

    await page.goto(PROFILE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(8000);

    console.log("Final URL:", page.url());
    console.log("Page title:", await page.title());

    const text = await page.locator("body").innerText();

    console.log("Page text length:", text.length);
    console.log("First 3000 characters:");
    console.log(text.slice(0, 3000));

    const outputDir = path.join(
      process.cwd(),
      "data",
      "xueqiu",
      USER_ID
    );

    fs.mkdirSync(outputDir, {
      recursive: true
    });

    fs.writeFileSync(
      path.join(outputDir, "debug-page.txt"),
      text,
      "utf8"
    );

    await page.screenshot({
      path: path.join(outputDir, "debug-page.png"),
      fullPage: true
    });

    console.log("Debug files saved.");

  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
