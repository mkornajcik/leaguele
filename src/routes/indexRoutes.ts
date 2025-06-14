import { Router } from "express";
import {
  quoteValidation,
  abilityKeyValidation,
  classicValidation,
  abilityValidation,
  abilityNameValidation,
  emojiValidation,
  splashValidation,
  splashNameValidation,
} from "../utils/validation.js";
import {
  getPage,
  getClassic,
  postClassic,
  getEmoji,
  getAbility,
  getQuote,
  getSplash,
  postQuote,
  postAbility,
  postKey,
  postAbilityName,
  postSplash,
  postSplashName,
  postEmoji,
  getPrivacy,
} from "../controllers/championsController.js";

const router = Router();

router.get("/privacy", getPrivacy);

router.get("/classic", getClassic);
router.post("/classic", classicValidation, postClassic);

router.get("/emoji", getEmoji);
router.post("/emoji", emojiValidation, postEmoji);

router.post("/ability/key", abilityKeyValidation, postKey);
router.post("/ability/name", abilityNameValidation, postAbilityName);

router.get("/ability", getAbility);
router.post("/ability", abilityValidation, postAbility);

router.get("/quote", getQuote);
router.post("/quote", quoteValidation, postQuote);

router.get("/splash", getSplash);
router.post("/splash", splashValidation, postSplash);
router.post("/splash/name", splashNameValidation, postSplashName);

router.get("/", getPage);

export default router;
