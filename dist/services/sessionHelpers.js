export function getCompletionFlags(reqSession) {
    const classicGuesses = Array.isArray(reqSession.classicGuesses) ? reqSession.classicGuesses : [];
    const isClassicComplete = classicGuesses.some((entry) => entry.correct === true);
    const quoteGuesses = Array.isArray(reqSession.quoteGuesses) ? reqSession.quoteGuesses : [];
    const isQuoteComplete = quoteGuesses.some((entry) => entry.correct === true);
    const abilityGuesses = Array.isArray(reqSession.abilityGuesses) ? reqSession.abilityGuesses : [];
    const isAbilityComplete = abilityGuesses.some((entry) => entry.correct === true);
    const splashGuesses = Array.isArray(reqSession.splashGuesses) ? reqSession.splashGuesses : [];
    const isSplashComplete = splashGuesses.some((entry) => entry.correct === true);
    const isEmojiComplete = typeof reqSession.isEmojiComplete === "boolean" ? reqSession.isEmojiComplete : false;
    return {
        isClassicComplete,
        isQuoteComplete,
        isAbilityComplete,
        isSplashComplete,
        isEmojiComplete,
    };
}
