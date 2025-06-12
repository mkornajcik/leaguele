import { getAllChampions, compareChampions, getRandomChampion, getRandomQuote, compareQuotes, getRandomAbility, compareAbilities, getRandomSplash, compareSplashes, getRandomEmojiChallenge, compareEmojis, } from "../services/championService.js";
import { getCompletionFlags } from "../services/sessionHelpers.js";
import { catchAsync } from "../services/catchAsync.js";
import { AppError } from "../types/appError.js";
// ----- Helper functions -----
// Helper to shuffle arrays
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
//Helper for splash: Returns random X and Y within a circle of radius around the center
function getRandomCoordinatesExcludingBorder(widthPx, heightPx, borderRatio = 0.05) {
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
function randomRotation() {
    const degrees = [90, 180, 270];
    const index = Math.floor(Math.random() * degrees.length);
    return degrees[index];
}
// Compare ability keys helper
function compareKeys(req, guessKey) {
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
function compareNames(req, guessName) {
    const correctName = req.session.abilityName;
    req.session.abilityNameGuesses = req.session.abilityNameGuesses || [];
    const isCorrect = guessName === correctName;
    req.session.abilityNameGuesses.push({
        guess: guessName,
        correct: isCorrect,
    });
    return isCorrect;
}
//Compare splash name helper
function compareSplashNames(req, guessName) {
    const correctName = req.session.splashName;
    req.session.splashNameGuesses = req.session.splashNameGuesses || [];
    const isCorrect = guessName === correctName;
    req.session.splashNameGuesses.push({
        guess: guessName,
        correct: isCorrect,
    });
    return isCorrect;
}
// ----- Controller functions -----
export const getPrivacy = catchAsync(async (req, res, next) => {
    const flags = getCompletionFlags(req.session);
    res.status(200).render("privacy", { flags });
});
export const getPage = catchAsync(async (req, res, next) => {
    const flags = getCompletionFlags(req.session);
    res.status(200).render("index", { flags });
});
export const getClassic = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    if (!req.session.comparisons) {
        req.session.classicTarget = getRandomChampion().name;
        req.session.comparisons = [];
    }
    const flags = getCompletionFlags(req.session);
    res.status(200).render("classic", {
        champions: getAllChampions(),
        targetName: req.session.classicTarget,
        comparisons: req.session.comparisons,
        guessCount: req.session.comparisons?.length,
        flags,
    });
});
export const postClassic = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    const { guessName } = req.body;
    const targetName = req.session.classicTarget;
    const comparison = compareChampions(guessName, targetName);
    const comparisonWithGuess = {
        ...comparison,
        guessName,
    };
    req.session.comparisons.push(comparisonWithGuess);
    req.session.classicGuesses = req.session.classicGuesses || [];
    req.session.classicGuesses.push({
        guess: guessName,
        correct: comparison.isClassicCorrect,
    });
    if (comparison.isClassicCorrect) {
        req.session.isClassicComplete = true;
    }
    let guessCount = req.session.comparisons?.length;
    res.json({
        isCorrect: comparison.isClassicCorrect,
        icon: comparison.icon,
        guessName,
        guessCount,
        comparison: comparisonWithGuess,
    });
});
export const getQuote = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    if (!req.session.quoteTarget || !req.session.quoteText) {
        const { champion, quote } = getRandomQuote();
        req.session.quoteTarget = champion;
        req.session.quoteText = quote;
        req.session.quoteGuesses = [];
    }
    const flags = getCompletionFlags(req.session);
    res.status(200).render("quote", {
        targetQuote: req.session.quoteText,
        guesses: req.session.quoteGuesses || [],
        targetName: req.session.quoteTarget,
        guessCount: req.session.quoteGuesses?.length,
        champions: getAllChampions(),
        flags,
    });
});
export const postQuote = catchAsync(async (req, res, next) => {
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
    res.json({
        correct: result.correct,
        icon: result.icon,
        guessName,
        guessCount,
    });
});
export const getAbility = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    if (!req.session.abilityTarget) {
        const { champion, key, name, icon, allAbilities } = getRandomAbility();
        req.session.abilityTarget = champion;
        req.session.abilityKey = key;
        req.session.abilityName = name;
        req.session.abilityIcon = icon;
        req.session.allAbilities = allAbilities;
        req.session.abilityGuesses = [];
        req.session.keyGuesses = [];
    }
    if (!req.session.abilityShuffledNames) {
        req.session.abilityShuffledNames = shuffleArray(req.session.allAbilities);
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
    });
});
export const postAbility = catchAsync(async (req, res, next) => {
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
    res.json({
        correct: result.correct,
        icon: result.icon,
        guessName,
        guessCount,
    });
});
export const postKey = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    const { guessKey } = req.body;
    const isCorrect = compareKeys(req, guessKey);
    res.json({ correct: isCorrect });
});
export const postAbilityName = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    const { guessName } = req.body;
    const isCorrect = compareNames(req, guessName);
    res.json({ correct: isCorrect });
});
export const getEmoji = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    if (!req.session.emojiTarget) {
        const { champion, emojis } = getRandomEmojiChallenge();
        req.session.emojiTarget = champion;
        req.session.emojiList = emojis;
        req.session.emojiGuesses = [];
        req.session.displayedEmojis = 1;
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
    });
});
export const postEmoji = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    const { guessName, targetName } = req.body;
    const result = compareEmojis(guessName, targetName);
    req.session.displayedEmojis += 1;
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
    const nextEmoji = req.session.emojiList[req.session.displayedEmojis - 1];
    res.json({
        correct: result.correct,
        icon: result.icon,
        guessName,
        nextEmoji,
        guessCount,
    });
});
export const getSplash = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    if (!req.session.splashTarget) {
        const { champion, splashImage, splashName, allSplashes } = getRandomSplash();
        req.session.splashTarget = champion;
        req.session.splashImage = splashImage;
        req.session.splashName = splashName;
        req.session.allSplashes = allSplashes;
        req.session.splashGuesses = [];
        req.session.splashNameGuesses = [];
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
    });
});
export const postSplash = catchAsync(async (req, res, next) => {
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
    res.json({
        correct: result.correct,
        icon: result.icon,
        guessName,
        guessCount,
    });
});
export const postSplashName = catchAsync(async (req, res, next) => {
    if (!req.session) {
        return next(new AppError("Session not configured", 500));
    }
    const { guessSplash } = req.body;
    const isCorrect = compareSplashNames(req, guessSplash);
    res.json({ correct: isCorrect });
});
