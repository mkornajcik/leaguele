import championsJson from "../data/champions_final.json";
import championQuotes from "../data/champion_quotes_new.json";
import championAbilities from "../data/champion_abilities.json";
import championSplash from "../data/champions_splash.json";
import championEmojis from "../data/champion_emojis_new.json";
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
export function getRandomChampion() {
    const all = Object.values(championsJson);
    return all[Math.floor(Math.random() * all.length)];
}
/* const quotesDataUrl = new URL("../data/champion_quotes_new.json", import.meta.url);
const rawQuotes = fs.readFileSync(quotesDataUrl, "utf-8");
//const championQuotes: Record<string, string[]> = JSON.parse(rawQuotes); */
function getRandomChampionWithQuote() {
    const champions = Object.keys(championQuotes).filter((champ) => Array.isArray(championQuotes[champ]) &&
        championQuotes[champ].length > 0);
    if (champions.length === 0)
        throw new Error("No champions with quotes available.");
    return champions[Math.floor(Math.random() * champions.length)];
}
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
/* const abilitiesDataUrl = new URL("../data/champion_abilities.json", import.meta.url);
const rawAbilities = fs.readFileSync(abilitiesDataUrl, "utf-8");
//const championAbilities: Record<string, Record<string, [string, string]>> = JSON.parse(rawAbilities); */
function getRandomChampionWithAbility() {
    const champions = Object.keys(championAbilities).filter((champ) => typeof championAbilities[champ] === "object" &&
        Object.keys(championAbilities[champ]).length > 0);
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
/* const splashDataUrl = new URL("../data/champions_splash.json", import.meta.url);
const rawSplash = fs.readFileSync(splashDataUrl, "utf-8");
// const championSplash: Record<string, string[]> = JSON.parse(rawSplash); */
function getRandomChampionWithSplash() {
    const champions = Object.keys(championSplash).filter((champ) => typeof championSplash[champ] === "object" &&
        Object.keys(championSplash[champ]).length > 0);
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
/* const emojisDataUrl = new URL("../data/champion_emojis_new.json", import.meta.url);
const rawEmojis = fs.readFileSync(emojisDataUrl, "utf-8");
// const championEmojis: Record<string, string[]> = JSON.parse(rawEmojis); */
function getRandomChampionWithEmojis() {
    const champions = Object.keys(championEmojis).filter((champ) => Array.isArray(championEmojis[champ]) &&
        championEmojis[champ].length >= 4);
    if (champions.length === 0) {
        throw new Error("No champions with at least 4 emojis available.");
    }
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
    const champion = getRandomChampionWithEmojis();
    const allEmojis = championEmojis[champion];
    const emojis = shuffleArray(allEmojis).slice(0, 4);
    return { champion, emojis };
}
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
