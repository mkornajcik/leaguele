const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const BASE_URL = "https://universe.leagueoflegends.com/en_us/champion/";

function championUrlName(name) {
  return name.toLowerCase().replace(/[\s'.]/g, "");
}

function capitalize(str) {
  if (!str || typeof str !== "string") return "Unknown";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function scrapeChampion(page, champName) {
  const url = BASE_URL + championUrlName(champName) + "/";
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    await page
      .waitForFunction(
        () =>
          !!document.querySelector("li.ChampionRace_a_Fp.left_2mmO h6") ||
          !!document.querySelector('span[data-gettext-identifier^="faction-"]'),
        { timeout: 10000 }
      )
      .catch(() => {});

    let species = await page
      .$eval("li.ChampionRace_a_Fp.left_2mmO h6", (el) => el.innerText.trim())
      .catch(() => "Unknown");

    let region = await page
      .$eval('span[data-gettext-identifier^="faction-"]', (el) => el.innerText.trim())
      .catch(() => "Unknown");

    species = capitalize(species);
    region = capitalize(region);

    console.log(species, region);

    return { species, region };
  } catch (err) {
    console.error(`Error scraping ${champName}: ${err.message}`);
    return { species: "Unknown", region: "Unknown" };
  }
}

(async () => {
  const championObj = JSON.parse(await fs.readFile("champions_full.json", "utf8"));
  const championNames = Object.keys(championObj);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const results = {};

  for (const champName of championNames) {
    console.log(`Scraping: ${champName}`);
    const data = await scrapeChampion(page, champName);
    results[champName] = data;
    await new Promise((res) => setTimeout(res, 1000));
  }

  await browser.close();

  await fs.writeFile("champion_species_region.json", JSON.stringify(results, null, 2));
  console.log("Scraping complete! Output saved to champion_species_region.json");
})();
