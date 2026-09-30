const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const USER_ID = "9493911686";
const PROFILE_URL = `https://xueqiu.com/u/${USER_ID}`;

(async () => {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  // 记录浏览器错误
  page.on("pageerror", error => {
    console.log("PAGE ERROR:", error.message);
  });

  page.on("requestfailed", request => {
    console.log(
      "REQUEST FAILED:",
      request.url(),
      request.failure()?.errorText
    );
  });

  try {
    console.log("Opening:", PROFILE_URL);

    const response = await page.goto(PROFILE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    console.log("HTTP status:", response?.status());
    console.log("Response URL:", response?.url());
    console.log("Content-Type:", response?.headers()["content-type"]);
    console.log("Final URL:", page.url());

    await page.waitForTimeout(8000);

    console.log("Page title:", await page.title());

    const html = await page.content();
    const text = await page.locator("body").innerText();

    console.log("HTML length:", html.length);
    console.log("Text length:", text.length);
    console.log("HTML preview:");
    console.log(html.slice(0, 3000));

    const outputDir = path.join(
      process.cwd(), "data", "xueqiu", USER_ID
    );

    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
      path.join(outputDir, "debug-page.html"),
      html,
      "utf8"
    );

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
    console.error("DIAGNOSTIC FAILED:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
