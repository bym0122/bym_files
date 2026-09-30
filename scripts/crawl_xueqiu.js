const { chromium } = require("playwright");

const USER_ID = "9493911686";

const PROFILE_URL =
  `https://xueqiu.com/u/${USER_ID}`;

const API_URL =
  `https://api.xueqiu.com/v4/statuses/user_timeline.json` +
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
    // 1. 先访问雪球主页，建立浏览器会话
    console.log("Step 1: Opening profile");

    const profileResponse = await page.goto(PROFILE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    console.log(
      "Profile HTTP status:",
      profileResponse?.status()
    );

    console.log(
      "Profile title:",
      await page.title()
    );

    console.log(
      "Profile URL:",
      page.url()
    );

    // 等待一下，让 Cookie / 页面状态稳定
    await page.waitForTimeout(3000);

    // 2. 使用同一个 Playwright 浏览器上下文访问 API
    console.log("Step 2: Requesting API");

    const apiResponse = await page.goto(API_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    const body = await page.locator("body").innerText();

    console.log(
      "API HTTP status:",
      apiResponse?.status()
    );

    console.log(
      "API final URL:",
      page.url()
    );

    console.log(
      "API Content-Type:",
      apiResponse?.headers()["content-type"]
    );

    console.log(
      "Response length:",
      body.length
    );

    console.log("Response preview:");
    console.log(body.slice(0, 5000));

    // 3. 尝试解析 JSON
    try {
      const data = JSON.parse(body);

      console.log(
        "JSON parsed successfully."
      );

      console.log(
        "JSON keys:",
        Object.keys(data)
      );

      console.log(
        "Error code:",
        data.error_code ?? "none"
      );

      const posts =
        data.list ||
        data.statuses ||
        [];

      console.log(
        "Posts found:",
        posts.length
      );

      // 如果真的拿到了帖子，打印第一条的结构
      if (posts.length > 0) {
        console.log(
          "First post:"
        );

        console.log(
          JSON.stringify(
            posts[0],
            null,
            2
          ).slice(0, 5000)
        );
      }

    } catch (error) {
      console.log(
        "Response is not valid JSON."
      );
    }

  } catch (error) {

    console.error(
      "PLAYWRIGHT ERROR:",
      error.message
    );

    process.exitCode = 1;

  } finally {

    await browser.close();

  }
})();
