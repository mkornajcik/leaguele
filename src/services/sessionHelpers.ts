export interface CompletionFlags {
  isClassicComplete: boolean;
  isQuoteComplete: boolean;
  isAbilityComplete: boolean;
  isSplashComplete: boolean;
  isEmojiComplete: boolean;
}

export function getCompletionFlags(reqSession: any): CompletionFlags {
  const classicGuesses = Array.isArray(reqSession.classicGuesses) ? (reqSession.classicGuesses as any[]) : [];
  const isClassicComplete = classicGuesses.some((entry) => entry.correct === true);

  const quoteGuesses = Array.isArray(reqSession.quoteGuesses) ? (reqSession.quoteGuesses as any[]) : [];
  const isQuoteComplete = quoteGuesses.some((entry) => entry.correct === true);

  const abilityGuesses = Array.isArray(reqSession.abilityGuesses) ? (reqSession.abilityGuesses as any[]) : [];
  const isAbilityComplete = abilityGuesses.some((entry) => entry.correct === true);

  const splashGuesses = Array.isArray(reqSession.splashGuesses) ? (reqSession.splashGuesses as any[]) : [];
  const isSplashComplete = splashGuesses.some((entry) => entry.correct === true);

  const isEmojiComplete =
    typeof reqSession.isEmojiComplete === "boolean" ? (reqSession.isEmojiComplete as boolean) : false;

  return {
    isClassicComplete,
    isQuoteComplete,
    isAbilityComplete,
    isSplashComplete,
    isEmojiComplete,
  };
}
