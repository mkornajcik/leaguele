import { DateTime } from "luxon";
import {
  getRandomChampion,
  getRandomQuote,
  getRandomAbility,
  getRandomSplash,
  getRandomEmojiChallenge,
  init,
} from "./championService.js";
import { AppError } from "../types/appError.js";

// Call init to ensure all data are available
await init();

// Store todays champions and date
type DailyChampions = {
  date: string;
  classicToday: any;
  quoteToday: any;
  abilityToday: any;
  splashToday: any;
  emojiToday: any;
};

let daily: DailyChampions | null = null;

// Get date in Paris
export function getTodayParis(): string {
  const todayDate = DateTime.now().setZone("Europe/Paris").toISODate();
  if (todayDate === null) {
    throw new AppError("Invalid todayDate: null");
  }
  return todayDate;
}

export function getSecondsUntilMidnight(): number {
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
  return daily!;
}
