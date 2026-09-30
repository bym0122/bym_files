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
    },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  });

  try {
    console.log(`Opening: ${PROFILE_URL}`);

    await page.goto(PROFILE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    // Slowly scroll to trigger lazy loading.
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(800);
    }

    const links = await page.locator("a").evaluateAll((anchors) =>
      anchors
        .map((a) => ({
          text: (a.innerText || "").trim(),
          href: a.href || ""
        }))
        .filter((x) => x.href)
    );

    const posts = [];
    const seen = new Set();

    for (const item of links) {
      try {
        const url = new URL(item.href);

        if (url.hostname !== "xueqiu.com") {
          continue;
        }

        // Match this user's Xueqiu posts/replies.
        const match = url.pathname.match(
          new RegExp(`^/${USER_ID}/(\\d+)`)
        );

        if (!match) {
          continue;
        }

        const postId = match[1];

        if (seen.has(postId)) {
          continue;
        }

        seen.add(postId);

        posts.push({
          id: postId,
          url: item.href,
          title: item.text
        });
      } catch (_) {
        // Ignore malformed URLs.
      }
    }

    const now = new Date();

    const beijingDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);

    const beijingTime = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      dateStyle: "full",
      timeStyle: "medium"
    }).format(now);

    const output = {
      user_id: USER_ID,
      profile_url: PROFILE_URL,
      crawled_at_beijing: beijingTime,
      crawled_date: beijingDate,
      post_count: posts.length,
      posts
    };

    const outputDir = path.join(
      process.cwd(),
      "data",
      "xueqiu",
      USER_ID
    );

    fs.mkdirSync(outputDir, {
      recursive: true
    });

    const outputFile = path.join(
      outputDir,
      `${beijingDate}.json`
    );

    fs.writeFileSync(
      outputFile,
      JSON.stringify(output, null, 2),
      "utf8"
    );

    console.log(`Found ${posts.length} posts.`);
    console.log(`Saved to: ${outputFile}`);

  } catch (error) {
    console.error("Crawler failed:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
