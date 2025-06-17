import { NextFunction, Request, Response } from "express";
import {
  getAllChampions,
  compareChampions,
  compareQuotes,
  compareAbilities,
  compareSplashes,
  compareEmojis,
} from "../services/championService.js";
import { getCompletionFlags } from "../services/sessionHelpers.js";
import { catchAsync } from "../services/catchAsync.js";
import { AppError } from "../types/appError.js";
import { validationResult } from "express-validator";
import { getDailyChampions, getSecondsUntilMidnight } from "../services/dailyChampions.js";

// ----- Helper functions -----
// Helper to shuffle arrays
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

//Helper for splash: Returns random X and Y within a circle of radius around the center
export function getRandomCoordinatesExcludingBorder(
  widthPx: number,
  heightPx: number,
  borderRatio = 0.05
): { x: number; y: number } {
  if (borderRatio < 0 || borderRatio >= 0.5) {
    throw new Error(`Invalid borderRatio (${borderRatio}): must be >= 0 and < 0.5`);
  }

  const borderX = borderRatio * widthPx;
  const borderY = borderRatio * heightPx;

  const pixelX = borderX + Math.random() * (widthPx - 2 * borderX);
  const pixelY = borderY + Math.random() * (heightPx - 2 * borderY);

  const percentX = (pixelX / widthPx) * 100;
  const percentY = (pixelY / heightPx) * 100;

  return {
    x: Math.max(0, Math.min(100, percentX)),
    y: Math.max(0, Math.min(100, percentY)),
  };
}

// Helper to get random rotation for ability
export function randomRotation() {
  const degrees = [90, 180, 270];
  const index = Math.floor(Math.random() * degrees.length);
  return degrees[index];
}

// Compare ability keys helper
export function compareKeys(req: Request, guessKey: string) {
  const correctKey = req.session.abilityKey;

  req.session.keyGuesses = req.session.keyGuesses || [];

  const isCorrect = guessKey === correctKey;

  req.session.keyGuesses.push({
    guess: guessKey,
    correct: isCorrect,
  });

  return isCorrect;
}

//Compare ability names helper
export function compareNames(req: Request, guessName: string) {
  const correctName = req.session.abilityName!;

  req.session.abilityNameGuesses = req.session.abilityNameGuesses || [];

  const isCorrect = guessName === correctName;

  req.session.abilityNameGuesses.push({
    guess: guessName,
    correct: isCorrect,
  });

  return isCorrect;
}

//Compare splash name helper
export function compareSplashNames(req: Request, guessName: string) {
  const correctName = req.session.splashName!;

  req.session.splashNameGuesses = req.session.splashNameGuesses || [];

  const isCorrect = guessName === correctName;

  req.session.splashNameGuesses.push({
    guess: guessName,
    correct: isCorrect,
  });

  return isCorrect;
}

// ----- Controller functions -----
export const getPrivacy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const flags = getCompletionFlags(req.session);

  res.status(200).render("privacy", { flags });
});

export const getPage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { classicToday, quoteToday, abilityToday, emojiToday, splashToday } = getDailyChampions();

  if (
    req.session.classicTarget !== classicToday.name &&
    req.session.quoteTarget !== quoteToday.champion &&
    req.session.abilityTarget !== abilityToday.champion &&
    req.session.emojiTarget !== emojiToday.champion &&
    req.session.splashTarget !== splashToday.champion
  ) {
    req.session.isClassicComplete = false;
    req.session.classicGuesses = [];

    req.session.isQuoteComplete = false;
    req.session.quoteGuesses = [];

    req.session.isAbilityComplete = false;
    req.session.abilityGuesses = [];

    req.session.isEmojiComplete = false;
    req.session.emojiGuesses = [];

    req.session.isSplashComplete = false;
    req.session.splashGuesses = [];
  }

  const flags = getCompletionFlags(req.session);

  let secondsUntilReset = getSecondsUntilMidnight();

  res.status(200).render("index", { flags, secondsUntilReset });
});

export const getClassic = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  let secondsUntilReset = getSecondsUntilMidnight();

  const { classicToday } = getDailyChampions();

  if (req.session.classicTarget !== classicToday.name) {
    req.session.classicTarget = classicToday.name;
    req.session.comparisons = [];
    req.session.classicGuesses = [];
    req.session.isClassicComplete = false;
  }

  const flags = getCompletionFlags(req.session);

  res.status(200).render("classic", {
    champions: getAllChampions(),
    targetName: req.session.classicTarget,
    comparisons: req.session.comparisons,
    guessCount: req.session.comparisons?.length,
    flags,
    secondsUntilReset,
  });
});

export const postClassic = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Invalid classic input");
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  const { guessName } = req.body;
  const targetName = req.session.classicTarget!;

  const comparison = compareChampions(guessName, targetName);
  const comparisonWithGuess = {
    ...comparison,
    guessName,
  };

  req.session.comparisons!.push(comparisonWithGuess);

  req.session.classicGuesses = req.session.classicGuesses || [];
  req.session.classicGuesses.push({
    guess: guessName,
    correct: comparison.isClassicCorrect,
  });

  if (comparison.isClassicCorrect) {
    req.session.isClassicComplete = true;
  }

  let guessCount = req.session.comparisons?.length;

  res.status(200).json({
    isCorrect: comparison.isClassicCorrect,
    icon: comparison.icon,
    guessName,
    guessCount,
    comparison: comparisonWithGuess,
  });
});

export const getQuote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  let secondsUntilReset = getSecondsUntilMidnight();

  const { quoteToday } = getDailyChampions();

  if (req.session.quoteTarget !== quoteToday.champion) {
    const { champion, quote } = quoteToday;
    req.session.quoteTarget = champion;
    req.session.quoteText = quote;
    req.session.quoteGuesses = [];
    req.session.isQuoteComplete = false;
  }

  const flags = getCompletionFlags(req.session);

  res.status(200).render("quote", {
    targetQuote: req.session.quoteText,
    guesses: req.session.quoteGuesses || [],
    targetName: req.session.quoteTarget,
    guessCount: req.session.quoteGuesses?.length,
    champions: getAllChampions(),
    flags,
    secondsUntilReset,
  });
});

export const postQuote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Invalid quote input");
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  const { guessName, targetName } = req.body;

  const result = compareQuotes(guessName, targetName);

  // Store result in session for hints
  req.session.quoteGuesses = req.session.quoteGuesses || [];
  req.session.quoteGuesses.push({
    guess: result.champion,
    icon: result.icon,
    correct: result.correct,
  });

  let guessCount = req.session.quoteGuesses.length;

  if (result.correct) {
    req.session.isQuoteComplete = true;
  }

  /* res.redirect("/quote"); */
  res.status(200).json({
    correct: result.correct,
    icon: result.icon,
    guessName,
    guessCount,
  });
});

export const getAbility = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  let secondsUntilReset = getSecondsUntilMidnight();

  const { abilityToday } = getDailyChampions();

  if (req.session.abilityTarget !== abilityToday.champion) {
    const { champion, key, name, icon, allAbilities } = abilityToday;
    req.session.abilityTarget = champion;
    req.session.abilityName = name;
    req.session.abilityIcon = icon;
    req.session.abilityKey = key;
    req.session.allAbilities = allAbilities;
    req.session.abilityGuesses = [];
    req.session.abilityNameGuesses = [];
    req.session.abilityShuffledNames = [];
    req.session.keyGuesses = [];
    req.session.abilityRotation = 0;
    req.session.isAbilityComplete = false;
  }

  if (!req.session.abilityShuffledNames || req.session.abilityShuffledNames.length === 0) {
    req.session.abilityShuffledNames = shuffleArray(req.session.allAbilities!);
  }

  if (!req.session.abilityRotation || req.session.abilityRotation == 0) {
    req.session.abilityRotation = randomRotation();
  }

  const flags = getCompletionFlags(req.session);

  res.status(200).render("ability", {
    targetName: req.session.abilityTarget,
    targetKey: req.session.abilityKey,
    targetAbility: req.session.abilityName,
    targetIcon: req.session.abilityIcon,
    guesses: req.session.abilityGuesses || [],
    keyGuesses: req.session.keyGuesses || [],
    abilityNameGuesses: req.session.abilityNameGuesses || [],
    allAbilities: req.session.abilityShuffledNames,
    abilityRotation: req.session.abilityRotation,
    guessCount: req.session.abilityGuesses?.length,
    champions: getAllChampions(),
    flags,
    secondsUntilReset,
  });
});

export const postAbility = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Invalid ability input");
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  const { guessName, targetName } = req.body;

  const result = compareAbilities(guessName, targetName);

  req.session.abilityGuesses = req.session.abilityGuesses || [];
  req.session.abilityGuesses.push({
    guess: result.champion,
    icon: result.icon,
    correct: result.correct,
  });

  let guessCount = req.session.abilityGuesses?.length;

  if (result.correct) {
    req.session.isAbilityComplete = true;
  }

  res.status(200).json({
    correct: result.correct,
    icon: result.icon,
    guessName,
    guessCount,
  });
});

export const postKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Invalid ability key input");

    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  const { guessKey } = req.body;
  const isCorrect = compareKeys(req, guessKey);
  res.status(200).json({ correct: isCorrect });
});

export const postAbilityName = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Invalid ability name input");
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  const { guessName } = req.body;
  const isCorrect = compareNames(req, guessName);
  res.status(200).json({ correct: isCorrect });
});

export const getEmoji = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  let secondsUntilReset = getSecondsUntilMidnight();

  const { emojiToday } = getDailyChampions();

  if (req.session.emojiTarget !== emojiToday.champion) {
    const { champion, emojis } = emojiToday;
    req.session.emojiTarget = champion;
    req.session.emojiList = emojis;
    req.session.emojiGuesses = [];
    req.session.displayedEmojis = 1;
    req.session.isEmojiComplete = false;
  }

  const flags = getCompletionFlags(req.session);

  res.status(200).render("emoji", {
    targetEmojis: req.session.emojiList,
    guesses: req.session.emojiGuesses || [],
    targetName: req.session.emojiTarget,
    displayedEmojis: req.session.displayedEmojis,
    champions: getAllChampions(),
    guessCount: req.session.emojiGuesses?.length,
    flags,
    secondsUntilReset,
  });
});

export const postEmoji = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Invalid emoji input");
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  const { guessName, targetName } = req.body;

  const result = compareEmojis(guessName, targetName);

  req.session.displayedEmojis! += 1;
  req.session.emojiGuesses = req.session.emojiGuesses || [];
  req.session.emojiGuesses.push({
    guess: result.champion,
    icon: result.icon,
    correct: result.correct,
  });

  let guessCount = req.session.emojiGuesses?.length;

  if (result.correct) {
    req.session.isEmojiComplete = true;
  }

  const nextEmoji = req.session.emojiList![req.session.displayedEmojis! - 1];

  res.status(200).json({
    correct: result.correct,
    icon: result.icon,
    guessName,
    nextEmoji,
    guessCount,
  });
});

export const getSplash = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  let secondsUntilReset = getSecondsUntilMidnight();

  const { splashToday } = getDailyChampions();

  if (req.session.splashTarget !== splashToday.champion) {
    const { champion, splashImage, splashName, allSplashes } = splashToday;
    req.session.splashTarget = champion;
    req.session.splashImage = splashImage;
    req.session.splashName = splashName;
    req.session.allSplashes = allSplashes;
    req.session.splashGuesses = [];
    req.session.splashNameGuesses = [];
    req.session.originX = undefined;
    req.session.originY = undefined;
    req.session.isSplashComplete = false;
  }

  if (req.session.originX === undefined || req.session.originY === undefined) {
    const { x, y } = getRandomCoordinatesExcludingBorder(1215, 717, 0.05);
    req.session.originX = x;
    req.session.originY = y;
  }

  const guesses = req.session.splashGuesses || [];
  const originX = req.session.originX;
  const originY = req.session.originY;

  const flags = getCompletionFlags(req.session);

  res.status(200).render("splash", {
    targetSplash: req.session.splashTarget,
    splashImage: req.session.splashImage,
    targetName: req.session.splashName,
    allSplashes: req.session.allSplashes,
    guesses,
    splashNameGuesses: req.session.splashNameGuesses || [],
    champions: getAllChampions(),
    guessCount: guesses.length,

    flags,
    originX,
    originY,
    secondsUntilReset,
  });
});

export const postSplash = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Invalid splash input");
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  const { guessName, targetName } = req.body;

  const result = compareSplashes(guessName, targetName);

  // Store result in session for hints
  req.session.splashGuesses = req.session.splashGuesses || [];
  req.session.splashGuesses.push({
    guess: result.champion,
    icon: result.icon,
    correct: result.correct,
  });

  if (result.correct) {
    req.session.isSplashComplete = true;

    delete req.session.originX;
    delete req.session.originY;
  }
  let guessCount = req.session.splashGuesses?.length;

  res.status(200).json({
    correct: result.correct,
    icon: result.icon,
    guessName,
    guessCount,
  });
});

export const postSplashName = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Invalid splash name input");
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.session) {
    return next(new AppError("Session not configured", 500));
  }

  const { guessSplash } = req.body;
  const isCorrect = compareSplashNames(req, guessSplash);

  res.status(200).json({ correct: isCorrect });
});
