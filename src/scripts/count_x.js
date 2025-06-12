import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const quotesPath = path.resolve(__dirname, "../data/champion_quotes_new.json");
const rawQuotes = fs.readFileSync(quotesPath, "utf-8");
const championQuotes = JSON.parse(rawQuotes);

function countQuotes() {
  const data = Object.entries(championQuotes);

  data.forEach(([champion, quotes]) => {
    if (Array.isArray(quotes) && quotes.length < 5) {
      console.log(`${champion}: ${quotes.length} quotes`);
    }
  });
}

countQuotes();
