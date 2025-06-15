import { body } from "express-validator";
// Allow Unicode letters, digits, spaces, and straight quotes
const NAME_REGEX = /^[\p{L}0-9 ']+$/u;
export const classicValidation = [
    body("guessName")
        .trim()
        .notEmpty()
        .withMessage("guessName is required")
        .matches(NAME_REGEX)
        .withMessage("guessName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
];
export const quoteValidation = [
    body("guessName")
        .trim()
        .notEmpty()
        .withMessage("guessName is required")
        .matches(NAME_REGEX)
        .withMessage("guessName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
    body("targetName")
        .trim()
        .notEmpty()
        .withMessage("targetName is required")
        .matches(NAME_REGEX)
        .withMessage("targetName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
];
export const abilityValidation = [
    body("guessName")
        .trim()
        .notEmpty()
        .withMessage("guessName is required")
        .matches(NAME_REGEX)
        .withMessage("guessName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
    body("targetName")
        .trim()
        .notEmpty()
        .withMessage("targetName is required")
        .matches(NAME_REGEX)
        .withMessage("targetName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
];
export const abilityNameValidation = [
    body("guessName")
        .trim()
        .notEmpty()
        .withMessage("guessName is required")
        .matches(NAME_REGEX)
        .withMessage("guessName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
];
export const emojiValidation = [
    body("guessName")
        .trim()
        .notEmpty()
        .withMessage("guessName is required")
        .matches(NAME_REGEX)
        .withMessage("guessName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
    body("targetName")
        .trim()
        .notEmpty()
        .withMessage("targetName is required")
        .matches(NAME_REGEX)
        .withMessage("targetName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
];
export const splashValidation = [
    body("guessName")
        .trim()
        .notEmpty()
        .withMessage("guessName is required")
        .matches(NAME_REGEX)
        .withMessage("guessName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
    body("targetName")
        .trim()
        .notEmpty()
        .withMessage("targetName is required")
        .matches(NAME_REGEX)
        .withMessage("targetName contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
];
export const splashNameValidation = [
    body("guessSplash")
        .trim()
        .notEmpty()
        .withMessage("guessSplash is required")
        .matches(NAME_REGEX)
        .withMessage("guessSplash contains invalid characters; only letters, digits, spaces, and single quotes are allowed"),
];
export const abilityKeyValidation = [
    body("guessKey")
        .trim()
        .notEmpty()
        .withMessage("guessKey is required")
        .isAlphanumeric()
        .withMessage("guessKey must be alphanumeric"),
];
