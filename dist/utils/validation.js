import { body } from "express-validator";
export const classicValidation = [body("guessName").trim().notEmpty().escape().withMessage("guessName is required")];
export const quoteValidation = [
    body("guessName").trim().notEmpty().escape().withMessage("guessName is required"),
    body("targetName").trim().notEmpty().escape().withMessage("targetName is required"),
];
export const abilityValidation = [
    body("guessName").trim().notEmpty().escape().withMessage("guessName is required"),
    body("targetName").trim().notEmpty().escape().withMessage("targetName is required"),
];
export const abilityNameValidation = [
    body("guessName").trim().notEmpty().escape().withMessage("guessName is required"),
];
export const emojiValidation = [
    body("guessName").trim().notEmpty().escape().withMessage("guessName is required"),
    body("targetName").trim().notEmpty().escape().withMessage("targetName is required"),
];
export const splashValidation = [
    body("guessName").trim().notEmpty().escape().withMessage("guessName is required"),
    body("targetName").trim().notEmpty().escape().withMessage("targetName is required"),
];
export const splashNameValidation = [
    body("guessSplash").trim().notEmpty().escape().withMessage("guessSplash is required"),
];
export const abilityKeyValidation = [body("guessKey").trim().notEmpty().escape().withMessage("guessKey is required")];
