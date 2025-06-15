import championsJson from "../data/champions_final.json";
import championQuotes from "../data/champion_quotes_new.json";
import championAbilities from "../data/champion_abilities.json";
import championSplash from "../data/champions_splash.json";
import championEmojis from "../data/champion_emojis_new.json";

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

export interface RandomChampionResult {
  name: string;
}

export interface CompareDateResult extends CompareFieldResult {
  hint: "before" | "after" | "exact";
}

// ******************************************************* Champions
// Read JSON data via URL
/* const championsDataUrl = new URL("../data/champions_final.json", import.meta.url);
const rawJson = fs.readFileSync(championsDataUrl, "utf-8");
//const championsJson: Record<string, string[]> = JSON.parse(rawJson); */

const championsWithIcons = Object.values(championsJson).map((champ) => ({
  name: champ.name,
  icon: champ.icon,
}));

export function getAllChampions() {
  return championsWithIcons;
}

export function getRandomChampion(): RandomChampionResult {
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

/* const quotesDataUrl = new URL("../data/champion_quotes_new.json", import.meta.url);
const rawQuotes = fs.readFileSync(quotesDataUrl, "utf-8");
//const championQuotes: Record<string, string[]> = JSON.parse(rawQuotes); */

function getRandomChampionWithQuote(): string {
  const champions = Object.keys(championQuotes).filter(
    (champ) =>
      Array.isArray(championQuotes[champ as keyof typeof championQuotes]) &&
      championQuotes[champ as keyof typeof championQuotes].length > 0
  );
  if (champions.length === 0) throw new Error("No champions with quotes available.");
  return champions[Math.floor(Math.random() * champions.length)];
}

export function getRandomQuote(): RandomQuoteResult {
  const champion = getRandomChampionWithQuote();
  const quotes = championQuotes[champion as keyof typeof championQuotes];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return { champion, quote };
}

export function compareQuotes(
  guessKey: keyof typeof championsJson,
  targetKey: keyof typeof championsJson
): CompareQuoteResult {
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

export interface RandomAbilityResult {
  champion: string;
  key: string; // P, Q, W, E, R
  name: string;
  icon: string;
  allAbilities: string[];
}

/* const abilitiesDataUrl = new URL("../data/champion_abilities.json", import.meta.url);
const rawAbilities = fs.readFileSync(abilitiesDataUrl, "utf-8");
//const championAbilities: Record<string, Record<string, [string, string]>> = JSON.parse(rawAbilities); */

function getRandomChampionWithAbility(): string {
  const champions = Object.keys(championAbilities).filter(
    (champ) =>
      typeof championAbilities[champ as keyof typeof championAbilities] === "object" &&
      Object.keys(championAbilities[champ as keyof typeof championAbilities]).length > 0
  );
  if (champions.length === 0) throw new Error("No champions with abilities available.");
  return champions[Math.floor(Math.random() * champions.length)];
}

export function getRandomAbility(): RandomAbilityResult {
  const champion = getRandomChampionWithAbility();
  const abilities = championAbilities[champion as keyof typeof championAbilities];

  const keys = Object.keys(abilities); // ["P", "Q", "W", "E", "R"]
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const [name, icon] = abilities[randomKey as keyof typeof abilities];

  const allAbilities = keys.map((k) => abilities[k as keyof typeof abilities][0]);

  return { champion, key: randomKey, name, icon, allAbilities };
}

export function compareAbilities(
  guessKey: keyof typeof championsJson,
  targetKey: keyof typeof championsJson
): CompareAbilityResult {
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
  splashImage: string | number;
  allSplashes: string[];
}

/* const splashDataUrl = new URL("../data/champions_splash.json", import.meta.url);
const rawSplash = fs.readFileSync(splashDataUrl, "utf-8");
// const championSplash: Record<string, string[]> = JSON.parse(rawSplash); */

function getRandomChampionWithSplash(): string {
  const champions = Object.keys(championSplash).filter(
    (champ) =>
      typeof championSplash[champ as keyof typeof championSplash] === "object" &&
      Object.keys(championSplash[champ as keyof typeof championSplash]).length > 0
  );

  if (champions.length === 0) throw new Error("No champions with splashes available.");
  return champions[Math.floor(Math.random() * champions.length)];
}

export function getRandomSplash(): RandomSplashResult {
  const champion = getRandomChampionWithSplash();
  const splashes = championSplash[champion as keyof typeof championSplash];

  const keys = Object.keys(splashes);
  const splashName: any = keys[Math.floor(Math.random() * keys.length)];
  const [cost, splashImage] = splashes[splashName as keyof typeof splashes];

  const allSplashes = keys;

  return { champion, splashName, splashImage, allSplashes };
}

export function compareSplashes(
  guessKey: keyof typeof championsJson,
  targetKey: keyof typeof championsJson
): CompareSplashResult {
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

/* const emojisDataUrl = new URL("../data/champion_emojis_new.json", import.meta.url);
const rawEmojis = fs.readFileSync(emojisDataUrl, "utf-8");
// const championEmojis: Record<string, string[]> = JSON.parse(rawEmojis); */

function getRandomChampionWithEmojis(): string {
  const champions = Object.keys(championEmojis).filter(
    (champ) =>
      Array.isArray(championEmojis[champ as keyof typeof championEmojis]) &&
      championEmojis[champ as keyof typeof championEmojis].length >= 4
  );
  if (champions.length === 0) {
    throw new Error("No champions with at least 4 emojis available.");
  }
  return champions[Math.floor(Math.random() * champions.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRandomEmojiChallenge(): RandomEmojiChallengeResult {
  const champion = getRandomChampionWithEmojis();
  const allEmojis = championEmojis[champion as keyof typeof championEmojis];
  const emojis = shuffleArray(allEmojis).slice(0, 4);
  return { champion, emojis };
}

export function compareEmojis(
  guessKey: keyof typeof championsJson,
  targetKey: keyof typeof championsJson
): CompareEmojiResult {
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
  const guess = championsJson[guessKey as keyof typeof championsJson];
  const target = championsJson[targetKey as keyof typeof championsJson];

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

    if (field === "species" || field === "position") {
      if (g === t) return { guess: g, actual: t, correct: true };
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
