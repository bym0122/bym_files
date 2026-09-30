const { chromium } = require("playwright");

const USER_ID = "9493911686";

const API_URL =
  `https://xueqiu.com/v4/statuses/user_timeline.json` +
  `?user_id=${USER_ID}&page=1&count=20`;

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/131.0.0.0 Safari/537.36"
  });

  try {
    console.log("Opening API with Playwright:", API_URL);

    const response = await page.goto(API_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    console.log("HTTP status:", response?.status());
    console.log("Final URL:", page.url());
    console.log(
      "Content-Type:",
      response?.headers()["content-type"]
    );

    const body = await page.locator("body").innerText();

    console.log("Response length:", body.length);
    console.log("Response preview:");
    console.log(body.slice(0, 3000));

    try {
      const data = JSON.parse(body);

      console.log("JSON parsed successfully.");
      console.log("Top-level keys:", Object.keys(data));

      const posts = data.statuses || data.list || [];
      console.log("Posts found:", posts.length);
    } catch {
      console.log("Response is not valid JSON.");
    }

  } catch (error) {
    console.error("PLAYWRIGHT ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
