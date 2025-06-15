import { DateTime } from "luxon";
import { getRandomChampion, getRandomQuote, getRandomAbility, getRandomSplash, getRandomEmojiChallenge, } from "./championService";
import { AppError } from "../types/appError";
let daily = null;
// Get date in Paris
export function getTodayParis() {
    const todayDate = DateTime.now().setZone("Europe/Paris").toISODate();
    if (todayDate === null) {
        throw new AppError("Invalid todayDate: null");
    }
    return todayDate;
}
export function getSecondsUntilMidnight() {
    // Current time in Paris
    const now = DateTime.now().setZone("Europe/Paris");
    // Next midnight in Paris
    const nextMidnight = now.plus({ days: 1 }).startOf("day");
    // Difference in seconds
    return Math.floor(nextMidnight.diff(now, "seconds").seconds);
}
// Assign new champions for today
export function assignDailyChampions() {
    daily = {
        date: getTodayParis(),
        classicToday: getRandomChampion(),
        quoteToday: getRandomQuote(),
        abilityToday: getRandomAbility(),
        splashToday: getRandomSplash(),
        emojiToday: getRandomEmojiChallenge(),
    };
}
// Get todays champions - refresh if needed
export function getDailyChampions() {
    const today = getTodayParis();
    if (!daily || daily.date !== today) {
        assignDailyChampions();
    }
    return daily;
}
