const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const out = path.join(__dirname, "..", "docs", "images");
fs.mkdirSync(out, { recursive: true });

const edge =
  process.env.EDGE_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function shot(page, name) {
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: path.join(out, name), fullPage: true });
  console.log("saved", name);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: edge,
    headless: true,
    args: ["--disable-gpu", "--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 860 });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await shot(page, "01-top.png");

  await page.goto("http://localhost:3000/reception", { waitUntil: "networkidle0" });
  await shot(page, "02-reception.png");

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => b.textContent?.includes("ご予約の方"))?.click();
  });
  await shot(page, "03-reception-checkin.png");

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => b.textContent?.trim() === "戻る")?.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => /チェックアウト|お帰り/.test(b.textContent || ""))?.click();
  });
  await shot(page, "04-reception-checkout.png");

  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0" });
  await shot(page, "05-admin-login.png");

  await page.type("input", "1234");
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => b.textContent?.includes("入室する"))?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes("本日の受付"), { timeout: 8000 });
  await shot(page, "06-admin-today.png");

  await page.goto("http://localhost:3000/admin/schedule", { waitUntil: "networkidle0" });
  await shot(page, "07-admin-schedule.png");

  await page.goto("http://localhost:3000/admin/settings", { waitUntil: "networkidle0" });
  await shot(page, "08-admin-settings.png");

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
