const { chromium } = require("playwright");

const USER_ID = "9493911686";

const PROFILE_URL =
  `https://xueqiu.com/u/${USER_ID}`;

const API_URL =
  `https://xueqiu.com/v4/statuses/user_timeline.json` +
  `?user_id=${USER_ID}&page=1&count=20`;

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/131.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  try {
    console.log("Step 1: Opening profile");

    const profileResponse = await page.goto(PROFILE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    console.log(
      "Profile HTTP status:",
      profileResponse?.status()
    );
    console.log("Profile title:", await page.title());
    console.log("Profile URL:", page.url());

    console.log("Step 2: Requesting API in same browser");

    const apiResponse = await page.goto(API_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    const body = await page.locator("body").innerText();

    console.log("API HTTP status:", apiResponse?.status());
    console.log("API final URL:", page.url());
    console.log(
      "API Content-Type:",
      apiResponse?.headers()["content-type"]
    );
    console.log("Response:", body.slice(0, 2000));

    try {
      const data = JSON.parse(body);
      console.log("JSON keys:", Object.keys(data));
      console.log("Error code:", data.error_code ?? "none");
      console.log(
        "Posts found:",
        (data.statuses || data.list || []).length
      );
    } catch {
      console.log("API response is not JSON.");
    }

  } catch (error) {
    console.error("PLAYWRIGHT ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
