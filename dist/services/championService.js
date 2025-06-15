import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Generic JSON loader
async function loadJson(relativePath) {
    const filePath = join(__dirname, relativePath);
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
}
// Caches for loaded JSON data
let championsCache = null;
let quotesCache = null;
let abilitiesCache = null;
let splashCache = null;
let emojisCache = null;
export async function init() {
    // Load champion data
    championsCache = await loadJson("../data/champions_final.json");
    // Load quotes data
    quotesCache = await loadJson("../data/champion_quotes_new.json");
    // Load abilities
    abilitiesCache = await loadJson("../data/champion_abilities.json");
    // Load splash data
    splashCache = await loadJson("../data/champions_splash.json");
    // Load emojis
    emojisCache = await loadJson("../data/champion_emojis_new.json");
}
function ensureChampions() {
    if (!championsCache) {
        throw new Error("ChampionService not initialized: call init() before using");
    }
    return championsCache;
}
function ensureQuotes() {
    if (!quotesCache) {
        throw new Error("ChampionService not initialized: call init() before using");
    }
    return quotesCache;
}
function ensureAbilities() {
    if (!abilitiesCache) {
        throw new Error("ChampionService not initialized: call init() before using");
    }
    return abilitiesCache;
}
function ensureSplash() {
    if (!splashCache) {
        throw new Error("ChampionService not initialized: call init() before using");
    }
    return splashCache;
}
function ensureEmojis() {
    if (!emojisCache) {
        throw new Error("ChampionService not initialized: call init() before using");
    }
    return emojisCache;
}
// ******************************************************* Champions
export function getAllChampions() {
    const champs = ensureChampions();
    return Object.values(champs).map((champ) => ({ name: champ.name, icon: champ.icon }));
}
export function getRandomChampion() {
    const champs = ensureChampions();
    const keys = Object.keys(champs);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { name: champs[randomKey].name };
}
// ******************************************************* Quote
function getRandomChampionWithQuote() {
    const quotes = ensureQuotes();
    const champions = Object.keys(quotes).filter((champ) => {
        const arr = quotes[champ];
        return Array.isArray(arr) && arr.length > 0;
    });
    if (champions.length === 0)
        throw new Error("No champions with quotes available.");
    return champions[Math.floor(Math.random() * champions.length)];
}
export function getRandomQuote() {
    const quotes = ensureQuotes();
    const championKey = getRandomChampionWithQuote();
    const arr = quotes[championKey];
    const quote = arr[Math.floor(Math.random() * arr.length)];
    return { champion: championKey, quote };
}
export function compareQuotes(guessKey, targetKey) {
    const champs = ensureChampions();
    const guess = champs[guessKey];
    const target = champs[targetKey];
    if (!guess) {
        throw new Error(`Unknown champion key: ${guessKey}`);
    }
    if (!target) {
        throw new Error(`Unknown champion key: ${targetKey}`);
    }
    const correct = guessKey === targetKey;
    return { champion: guess.name, icon: guess.icon, correct };
}
// ******************************************************* Ability
function getRandomChampionWithAbility() {
    const abilities = ensureAbilities();
    const champions = Object.keys(abilities).filter((champ) => {
        const obj = abilities[champ];
        return typeof obj === "object" && Object.keys(obj).length > 0;
    });
    if (champions.length === 0)
        throw new Error("No champions with abilities available.");
    return champions[Math.floor(Math.random() * champions.length)];
}
export function getRandomAbility() {
    const champs = ensureChampions();
    const abilities = ensureAbilities();
    const championKey = getRandomChampionWithAbility();
    const champAbilities = abilities[championKey];
    const keys = Object.keys(champAbilities);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const [name, icon] = champAbilities[randomKey];
    const allAbilities = keys.map((k) => champAbilities[k][0]);
    return { champion: championKey, key: randomKey, name, icon, allAbilities };
}
export function compareAbilities(guessKey, targetKey) {
    const champs = ensureChampions();
    const guess = champs[guessKey];
    const target = champs[targetKey];
    if (!guess) {
        throw new Error(`Unknown champion key: ${guessKey}`);
    }
    if (!target) {
        throw new Error(`Unknown champion key: ${targetKey}`);
    }
    const correct = guessKey === targetKey;
    return { champion: guess.name, icon: guess.icon, correct };
}
// ******************************************************* Splash
function getRandomChampionWithSplash() {
    const splash = ensureSplash();
    const champions = Object.keys(splash).filter((champ) => {
        const obj = splash[champ];
        return typeof obj === "object" && Object.keys(obj).length > 0;
    });
    if (champions.length === 0)
        throw new Error("No champions with splashes available.");
    return champions[Math.floor(Math.random() * champions.length)];
}
export function getRandomSplash() {
    const champs = ensureChampions();
    const splash = ensureSplash();
    const championKey = getRandomChampionWithSplash();
    const champSplash = splash[championKey];
    const keys = Object.keys(champSplash);
    const splashName = keys[Math.floor(Math.random() * keys.length)];
    const [cost, splashImage] = champSplash[splashName];
    const allSplashes = keys;
    return { champion: championKey, splashName, splashImage, allSplashes };
}
export function compareSplashes(guessKey, targetKey) {
    const champs = ensureChampions();
    const guess = champs[guessKey];
    const target = champs[targetKey];
    if (!guess) {
        throw new Error(`Unknown champion key: ${guessKey}`);
    }
    if (!target) {
        throw new Error(`Unknown champion key: ${targetKey}`);
    }
    const correct = guessKey === targetKey;
    return { champion: guess.name, icon: guess.icon, correct };
}
// ******************************************************* Emoji
function getRandomChampionWithEmojis() {
    const emojis = ensureEmojis();
    const champions = Object.keys(emojis).filter((champ) => {
        const arr = emojis[champ];
        return Array.isArray(arr) && arr.length >= 4;
    });
    if (champions.length === 0)
        throw new Error("No champions with at least 4 emojis available.");
    return champions[Math.floor(Math.random() * champions.length)];
}
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
export function getRandomEmojiChallenge() {
    const champs = ensureChampions();
    const emojis = ensureEmojis();
    const championKey = getRandomChampionWithEmojis();
    const allEmojis = emojis[championKey];
    const chosen = shuffleArray(allEmojis).slice(0, 4);
    return { champion: championKey, emojis: chosen };
}
export function compareEmojis(guessKey, targetKey) {
    const champs = ensureChampions();
    const guess = champs[guessKey];
    const target = champs[targetKey];
    if (!guess) {
        throw new Error(`Unknown champion key: ${guessKey}`);
    }
    if (!target) {
        throw new Error(`Unknown champion key: ${targetKey}`);
    }
    const correct = guessKey === targetKey;
    return { champion: guess.name, icon: guess.icon, correct };
}
// ******************************************************* Compare Champions
export function compareChampions(guessKey, targetKey) {
    const champs = ensureChampions();
    const guess = champs[guessKey];
    const target = champs[targetKey];
    if (!guess) {
        throw new Error(`Unknown champion key: ${guessKey}`);
    }
    if (!target) {
        throw new Error(`Unknown champion key: ${targetKey}`);
    }
    const isClassicCorrect = guessKey === targetKey;
    const championField = (field) => {
        const g = guess[field];
        const t = target[field];
        if (field === "species" || field === "position") {
            if (g === t)
                return { guess: g, actual: t, correct: true };
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
