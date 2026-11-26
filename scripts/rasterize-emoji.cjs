// Converts the Fluent Emoji 3D PNGs (256px, from microsoft/fluentui-emoji)
// into small WebP files for public/emoji/. Uses headless Chrome's canvas, so
// no image library is needed.
//
//   node scripts/rasterize-emoji.cjs <path-to-puppeteer-core> <png-dir> public/emoji [size=192]
//
// <png-dir> holds files named after src/data/emojiImages.js values, e.g. fire.png.
const puppeteer = require(process.argv[2]);
const fs = require("fs");
const path = require("path");
const [, , , SRC, OUT, SIZE = "192"] = process.argv;
const size = Number(SIZE);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new", timeout: 120000, protocolTimeout: 300000,
  });
  const page = await browser.newPage();
  await page.goto("about:blank");
  let total = 0;
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".png"));
  for (const f of files) {
    const dataUrl = "data:image/png;base64," + fs.readFileSync(path.join(SRC, f)).toString("base64");
    const webp = await page.evaluate(async (src, size) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, size, size);
      return c.toDataURL("image/webp", 0.82);
    }, dataUrl, size);
    const buf = Buffer.from(webp.split(",")[1], "base64");
    total += buf.length;
    fs.writeFileSync(path.join(OUT, f.replace(/\.png$/, ".webp")), buf);
  }
  console.log(`wrote ${files.length} files, ${Math.round(total / 1024)} KB total`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
