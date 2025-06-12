import "express-session";
import { CompareChampionResult } from "../services/championService.js";

declare module "express-session" {
  interface SessionData {
    isClassicComplete: boolean;
    isQuoteComplete: boolean;
    isAbilityComplete: boolean;
    isSplashComplete: boolean;
    isEmojiComplete: boolean;

    originX: number;
    originY: number;

    classicTarget: string;
    comparisons: Array<CompareChampionResult & { guessName: string }>;
    classicGuesses: Array<{ guess: string; correct: boolean }>;

    quoteTarget?: string;
    quoteText?: string;
    quoteGuesses?: Array<{ guess: string; correct: boolean; icon: string }>;

    abilityTarget?: string;
    abilityName?: string;
    abilityIcon?: string;
    abilityKey?: string;
    allAbilities?: string[];
    abilityGuesses?: Array<{ guess: string; correct: boolean; icon: string }>;
    abilityNameGuesses?: Array<{ guess: string; correct: boolean }>;
    abilityShuffledNames?: string[];
    abilityRotation?: number;
    keyGuesses?: Array<{ guess: string; correct: boolean }>;

    splashTarget?: string;
    splashName?: string;
    splashImage?: string;
    allSplashes?: string[];
    splashGuesses?: Array<{ guess: string; correct: boolean; icon: string }>;
    splashNameGuesses?: Array<{ guess: string; correct: boolean }>;

    emojiTarget?: string;
    emojiList?: string[];
    emojiGuesses?: Array<{ guess: string; correct: boolean; icon: string }>;
    displayedEmojis?: number;
  }
}
