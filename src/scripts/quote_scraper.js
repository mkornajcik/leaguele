const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const CHAMPIONS_FILE = path.join(__dirname, "champions_final.json");
const OUTPUT_FILE = path.join(__dirname, "champion_quotes.json");

const CONCURRENCY = 4; // Number of pages to run in parallel
const MIN_QUOTE_LENGTH = 15; // Minimum length for a quote to be included

// delay between requests
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function getQuotesForChampion(page, championName) {
  const url = `https://wiki.leagueoflegends.com/en-us/${encodeURIComponent(championName)}/Audio`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    return await page.evaluate(
      (championName, minLen) => {
        function getQuotesFromSection(tag, sectionId) {
          const heading = document.querySelector(`${tag} > span.mw-headline#${sectionId}`);
          if (!heading) return [];
          // Find the closest UL
          let el = heading.parentElement.nextElementSibling;
          while (el && el.tagName !== "UL") {
            el = el.nextElementSibling;
          }
          if (!el) return [];
          // Get all <i> inside <li>
          return Array.from(el.querySelectorAll("li i")).map((i) => i.textContent.trim());
        }

        const nameRegex = new RegExp(championName, "i");

        // Collect quotes from sections
        let quotes = [...getQuotesFromSection("h2", "Taunt"), ...getQuotesFromSection("h2", "Joke")];

        // Remove quotes that mention name
        quotes = quotes.filter((q) => !nameRegex.test(q));

        // Remove quotes that are too short
        quotes = quotes.filter((q) => q.length >= minLen);

        // Remove duplicates and empty
        quotes = Array.from(new Set(quotes)).filter((q) => q.length > 0);

        return quotes;
      },
      championName,
      MIN_QUOTE_LENGTH
    );
  } catch (err) {
    console.error(`Error scraping ${championName}: ${err.message}`);
    return [];
  }
}

async function main() {
  // Load champions
  const champions = JSON.parse(fs.readFileSync(CHAMPIONS_FILE, "utf8"));
  const championNames = Object.keys(champions);

  const browser = await puppeteer.launch({ headless: true });
  const results = {};

  // Concurrency control
  let idx = 0;
  async function worker() {
    const page = await browser.newPage();
    while (idx < championNames.length) {
      const myIdx = idx++;
      const championName = championNames[myIdx];
      if (!championName) break;

      console.log(`Scraping quotes for: ${championName}`);
      const quotes = await getQuotesForChampion(page, championName);

      if (quotes.length === 0) {
        console.log(`No quotes found for ${championName}.`);
      }
      results[championName] = quotes;

      await delay(500);
    }
    await page.close();
  }

  // Start workers
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  await browser.close();

  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf8");
  console.log(`Done! Results saved to ${OUTPUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
