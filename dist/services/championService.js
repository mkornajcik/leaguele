import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ******************************************************* Champions
// All champions data
const dataPath = path.resolve(__dirname, "../data/champions_final.json");
const rawJson = fs.readFileSync(dataPath, "utf-8");
const championsJson = JSON.parse(rawJson);
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
// Quote data
const quotesPath = path.resolve(__dirname, "../data/champion_quotes_new.json");
const rawQuotes = fs.readFileSync(quotesPath, "utf-8");
const championQuotes = JSON.parse(rawQuotes);
// Returns a random champion name that has at least one quote
function getRandomChampionWithQuote() {
    const champions = Object.keys(championQuotes).filter((champ) => Array.isArray(championQuotes[champ]) && championQuotes[champ].length > 0);
    if (champions.length === 0)
        throw new Error("No champions with quotes available.");
    return champions[Math.floor(Math.random() * champions.length)];
}
// Get a random quote and the corresponding champion
export function getRandomQuote() {
    const champion = getRandomChampionWithQuote();
    const quotes = championQuotes[champion];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return { champion, quote };
}
export function compareQuotes(guessKey, targetKey) {
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
// Ability data
const abilitiesPath = path.resolve(__dirname, "../data/champion_abilities.json");
const rawAbilities = fs.readFileSync(abilitiesPath, "utf-8");
const championAbilities = JSON.parse(rawAbilities);
function getRandomChampionWithAbility() {
    const champions = Object.keys(championAbilities).filter((champ) => typeof championAbilities[champ] === "object" && Object.keys(championAbilities[champ]).length > 0);
    if (champions.length === 0)
        throw new Error("No champions with abilities available.");
    return champions[Math.floor(Math.random() * champions.length)];
}
export function getRandomAbility() {
    const champion = getRandomChampionWithAbility();
    const abilities = championAbilities[champion];
    const keys = Object.keys(abilities); // ["P", "Q", "W", "E", "R"]
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const [name, icon] = abilities[randomKey];
    const allAbilities = keys.map((k) => abilities[k][0]);
    return { champion, key: randomKey, name, icon, allAbilities };
}
export function compareAbilities(guessKey, targetKey) {
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
// Splash data
const splashPath = path.resolve(__dirname, "../data/champions_splash.json");
const rawSplash = fs.readFileSync(splashPath, "utf-8");
const championSplash = JSON.parse(rawSplash);
function getRandomChampionWithSplash() {
    const champions = Object.keys(championSplash).filter((champ) => typeof championSplash[champ] === "object" && Object.keys(championSplash[champ]).length > 0);
    if (champions.length === 0)
        throw new Error("No champions with splashes available.");
    return champions[Math.floor(Math.random() * champions.length)];
}
export function getRandomSplash() {
    const champion = getRandomChampionWithSplash();
    const splashes = championSplash[champion];
    const keys = Object.keys(splashes);
    const splashName = keys[Math.floor(Math.random() * keys.length)];
    const [cost, splashImage] = splashes[splashName];
    const allSplashes = keys;
    return { champion, splashName, splashImage, allSplashes };
}
export function compareSplashes(guessKey, targetKey) {
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
// Emoji data
const emojisPath = path.resolve(__dirname, "../data/champion_emojis_new.json");
const rawEmojis = fs.readFileSync(emojisPath, "utf-8");
const championEmojis = JSON.parse(rawEmojis);
// Returns a random champion name that has at least one emoji set
function getRandomChampionWithEmojis() {
    const champions = Object.keys(championEmojis).filter((champ) => Array.isArray(championEmojis[champ]) && championEmojis[champ].length >= 4);
    if (champions.length === 0) {
        throw new Error("No champions with at least 4 emojis available.");
    }
    return champions[Math.floor(Math.random() * champions.length)];
}
// Fisher-Yates shuffle
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
// Get a random champion and 4 emojis
export function getRandomEmojiChallenge() {
    const champion = getRandomChampionWithEmojis();
    const allEmojis = championEmojis[champion];
    // Shuffle and pick first 4 emojis
    const emojis = shuffleArray(allEmojis).slice(0, 4);
    return { champion, emojis };
}
// Compare function
export function compareEmojis(guessKey, targetKey) {
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
export function compareChampions(guessKey, targetKey) {
    const guess = championsJson[guessKey];
    const target = championsJson[targetKey];
    if (!guess) {
        throw new Error(`Unknown champion key: ${guessKey}`);
    }
    if (!target) {
        throw new Error(`Unknown champion key: ${targetKey}`);
    }
    const isClassicCorrect = guess === target;
    const championField = (field) => {
        const g = guess[field];
        const t = target[field];
        // Special handling for species
        if (field === "species") {
            if (g === t)
                return { guess: g, actual: t, correct: true };
            // Split by space and check for overlap
            const guessArr = g.split(" ").map((s) => s.toLowerCase());
            const targetArr = t.split(" ").map((s) => s.toLowerCase());
            const partial = guessArr.some((s) => targetArr.includes(s));
            return { guess: g, actual: t, correct: false, partial };
        }
        // Special handling for positions
        if (field === "position") {
            if (g === t)
                return { guess: g, actual: t, correct: true };
            // Split by space and check for overlap
            const guessArr = g.split(" ").map((s) => s.toLowerCase());
            const targetArr = t.split(" ").map((s) => s.toLowerCase());
            const partial = guessArr.some((s) => targetArr.includes(s));
            return { guess: g, actual: t, correct: false, partial };
        }
        return { guess: g, actual: t, correct: g === t };
    };
    const championDate = (field) => {
        const g = guess[field];
        const t = target[field];
        const correct = g === t;
        const guessedYear = Number(g);
        const actualYear = Number(t);
        let hint;
        if (correct) {
            hint = "exact";
        }
        else if (guessedYear < actualYear) {
            hint = "before";
        }
        else {
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
