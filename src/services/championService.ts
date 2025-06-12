import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

export interface ViewChampion {
  name: string;
  icon: string;
}

export interface FormattedChampion {
  name: string;
  resource: string;
  position: string;
  attackType: string;
  releaseDate: string;
  icon: string;
  gender: string;
  species: string;
  region: string;
}

interface CompareFieldResult {
  guess: string;
  actual: string;
  correct: boolean;
  partial?: boolean;
}

export interface CompareDateResult extends CompareFieldResult {
  hint: "before" | "after" | "exact";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ******************************************************* Champions
// All champions data
const dataPath = path.resolve(__dirname, "../data/champions_final.json");
const rawJson = fs.readFileSync(dataPath, "utf-8");
const championsJson: Record<string, FormattedChampion> = JSON.parse(rawJson);

const championsWithIcons = Object.values(championsJson).map((champ) => ({
  name: champ.name,
  icon: champ.icon,
}));

export function getAllChampions() {
  return championsWithIcons;
}

export function getRandomChampion() {
  const all = Object.values(championsJson);
  return all[Math.floor(Math.random() * all.length)];
}

// ******************************************************* Quote
export interface CompareQuoteResult {
  champion: string;
  icon: string;
  correct: boolean;
}

export interface RandomQuoteResult {
  champion: string;
  quote: string;
}

// Quote data
const quotesPath = path.resolve(__dirname, "../data/champion_quotes_new.json");
const rawQuotes = fs.readFileSync(quotesPath, "utf-8");
const championQuotes: Record<string, string[]> = JSON.parse(rawQuotes);

// Returns a random champion name that has at least one quote
function getRandomChampionWithQuote(): string {
  const champions = Object.keys(championQuotes).filter(
    (champ) => Array.isArray(championQuotes[champ]) && championQuotes[champ].length > 0
  );
  if (champions.length === 0) throw new Error("No champions with quotes available.");
  return champions[Math.floor(Math.random() * champions.length)];
}

// Get a random quote and the corresponding champion
export function getRandomQuote(): RandomQuoteResult {
  const champion = getRandomChampionWithQuote();
  const quotes = championQuotes[champion];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return { champion, quote };
}

export function compareQuotes(guessKey: string, targetKey: string): CompareQuoteResult {
  const guess = championsJson[guessKey];
  const target = championsJson[targetKey];

  if (!guess) {
    throw new Error(`Unknown champion key: ${guessKey}`);
  }
  if (!target) {
    throw new Error(`Unknown champion key: ${targetKey}`);
  }

  let correct = guessKey === targetKey;

  return {
    champion: guess.name,
    icon: guess.icon,
    correct,
  };
}
// ******************************************************* Ability
export interface CompareAbilityResult {
  champion: string;
  icon: string;
  correct: boolean;
}

interface RandomAbilityResult {
  champion: string;
  key: string; // P, Q, W, E, R
  name: string;
  icon: string;
  allAbilities: string[];
}

// Ability data
const abilitiesPath = path.resolve(__dirname, "../data/champion_abilities.json");
const rawAbilities = fs.readFileSync(abilitiesPath, "utf-8");
const championAbilities: Record<string, Record<string, [string, string]>> = JSON.parse(rawAbilities);

function getRandomChampionWithAbility(): string {
  const champions = Object.keys(championAbilities).filter(
    (champ) => typeof championAbilities[champ] === "object" && Object.keys(championAbilities[champ]).length > 0
  );
  if (champions.length === 0) throw new Error("No champions with abilities available.");
  return champions[Math.floor(Math.random() * champions.length)];
}

export function getRandomAbility(): RandomAbilityResult {
  const champion = getRandomChampionWithAbility();
  const abilities = championAbilities[champion];

  const keys = Object.keys(abilities); // ["P", "Q", "W", "E", "R"]
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const [name, icon] = abilities[randomKey];

  const allAbilities = keys.map((k) => abilities[k][0]);

  return { champion, key: randomKey, name, icon, allAbilities };
}

export function compareAbilities(guessKey: string, targetKey: string): CompareAbilityResult {
  const guess = championsJson[guessKey];
  const target = championsJson[targetKey];

  if (!guess) {
    throw new Error(`Unknown champion key: ${guessKey}`);
  }
  if (!target) {
    throw new Error(`Unknown champion key: ${targetKey}`);
  }

  let correct = guessKey === targetKey;

  return {
    champion: guess.name,
    icon: guess.icon,
    correct,
  };
}
// ******************************************************* Splash
export interface CompareSplashResult {
  champion: string;
  icon: string;
  correct: boolean;
}

export interface RandomSplashResult {
  champion: string;
  splashName: string;
  splashImage: string;
  allSplashes: string[];
}

// Splash data
const splashPath = path.resolve(__dirname, "../data/champions_splash.json");
const rawSplash = fs.readFileSync(splashPath, "utf-8");
const championSplash: Record<string, string[]> = JSON.parse(rawSplash);

function getRandomChampionWithSplash(): string {
  const champions = Object.keys(championSplash).filter(
    (champ) => typeof championSplash[champ] === "object" && Object.keys(championSplash[champ]).length > 0
  );
  if (champions.length === 0) throw new Error("No champions with splashes available.");
  return champions[Math.floor(Math.random() * champions.length)];
}

export function getRandomSplash(): RandomSplashResult {
  const champion = getRandomChampionWithSplash();
  const splashes = championSplash[champion];

  const keys = Object.keys(splashes);
  const splashName: any = keys[Math.floor(Math.random() * keys.length)];
  const [cost, splashImage] = splashes[splashName];

  const allSplashes = keys;

  return { champion, splashName, splashImage, allSplashes };
}

export function compareSplashes(guessKey: string, targetKey: string): CompareSplashResult {
  const guess = championsJson[guessKey];
  const target = championsJson[targetKey];

  if (!guess) {
    throw new Error(`Unknown champion key: ${guessKey}`);
  }
  if (!target) {
    throw new Error(`Unknown champion key: ${targetKey}`);
  }

  let correct = guessKey === targetKey;

  return {
    champion: guess.name,
    icon: guess.icon,
    correct,
  };
}

// ******************************************************* Emoji
export interface CompareEmojiResult {
  champion: string;
  icon: string;
  correct: boolean;
}

export interface RandomEmojiChallengeResult {
  champion: string;
  emojis: string[];
}

// Emoji data
const emojisPath = path.resolve(__dirname, "../data/champion_emojis_new.json");
const rawEmojis = fs.readFileSync(emojisPath, "utf-8");
const championEmojis: Record<string, string[]> = JSON.parse(rawEmojis);

// Returns a random champion name that has at least one emoji set
function getRandomChampionWithEmojis(): string {
  const champions = Object.keys(championEmojis).filter(
    (champ) => Array.isArray(championEmojis[champ]) && championEmojis[champ].length >= 4
  );
  if (champions.length === 0) {
    throw new Error("No champions with at least 4 emojis available.");
  }
  return champions[Math.floor(Math.random() * champions.length)];
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Get a random champion and 4 emojis
export function getRandomEmojiChallenge(): RandomEmojiChallengeResult {
  const champion = getRandomChampionWithEmojis();
  const allEmojis = championEmojis[champion];

  // Shuffle and pick first 4 emojis
  const emojis = shuffleArray(allEmojis).slice(0, 4);

  return { champion, emojis };
}

// Compare function
export function compareEmojis(guessKey: string, targetKey: string): CompareEmojiResult {
  const guess = championsJson[guessKey];
  const target = championsJson[targetKey];

  if (!guess) {
    throw new Error(`Unknown champion key: ${guessKey}`);
  }
  if (!target) {
    throw new Error(`Unknown champion key: ${targetKey}`);
  }

  let correct = guessKey === targetKey;

  return {
    champion: guess.name,
    icon: guess.icon,
    correct,
  };
}

// ******************************************************* Compare
export interface CompareChampionResult {
  resource: CompareFieldResult;
  position: CompareFieldResult;
  attackType: CompareFieldResult;
  releaseDate: CompareDateResult;
  gender: CompareFieldResult;
  species: CompareFieldResult;
  region: CompareFieldResult;
  icon: string;
  isClassicCorrect: boolean;
}

export function compareChampions(guessKey: string, targetKey: string): CompareChampionResult {
  const guess = championsJson[guessKey];
  const target = championsJson[targetKey];

  if (!guess) {
    throw new Error(`Unknown champion key: ${guessKey}`);
  }
  if (!target) {
    throw new Error(`Unknown champion key: ${targetKey}`);
  }

  const isClassicCorrect = guess === target;

  const championField = (field: keyof Omit<FormattedChampion, "name" | "icon">): CompareFieldResult => {
    const g = guess[field]!;
    const t = target[field]!;

    // Special handling for species
    if (field === "species") {
      if (g === t) return { guess: g, actual: t, correct: true };
      // Split by space and check for overlap
      const guessArr = g.split(" ").map((s) => s.toLowerCase());
      const targetArr = t.split(" ").map((s) => s.toLowerCase());
      const partial = guessArr.some((s) => targetArr.includes(s));
      return { guess: g, actual: t, correct: false, partial };
    }

    // Special handling for positions
    if (field === "position") {
      if (g === t) return { guess: g, actual: t, correct: true };
      // Split by space and check for overlap
      const guessArr = g.split(" ").map((s) => s.toLowerCase());
      const targetArr = t.split(" ").map((s) => s.toLowerCase());
      const partial = guessArr.some((s) => targetArr.includes(s));
      return { guess: g, actual: t, correct: false, partial };
    }

    return { guess: g, actual: t, correct: g === t };
  };

  const championDate = (field: "releaseDate"): CompareDateResult => {
    const g = guess[field]!;
    const t = target[field]!;
    const correct = g === t;
    const guessedYear = Number(g);
    const actualYear = Number(t);
    let hint: "before" | "after" | "exact";
    if (correct) {
      hint = "exact";
    } else if (guessedYear < actualYear) {
      hint = "before";
    } else {
      hint = "after";
    }
    return { guess: g, actual: t, correct, hint };
  };

  return {
    resource: championField("resource"),
    position: championField("position"),
    attackType: championField("attackType"),
    releaseDate: championDate("releaseDate"),
    gender: championField("gender"),
    species: championField("species"),
    region: championField("region"),
    icon: guess.icon,
    isClassicCorrect,
  };
}
