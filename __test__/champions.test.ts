import request from "supertest";
import app from "../src/app.js";
import {
  shuffleArray,
  getRandomCoordinatesExcludingBorder,
  randomRotation,
} from "../src/controllers/championsController.js";
import * as champService from "../src/services/championService.js";
import * as dailyChampions from "../src/services/dailyChampions.js";
import { jest } from "@jest/globals";
import { load } from "cheerio";

// --------------------- Helpers ---------------------
describe("shuffleArray", () => {
  test("returns array with same elements but different order", () => {
    const arr = [1, 2, 3, 4, 5];
    const arrCopy = [...arr];
    const shuffled = shuffleArray(arr);
    // same length
    expect(shuffled).toHaveLength(arr.length);
    // same elements - sort and compare
    expect([...shuffled].sort()).toEqual([...arr].sort());
    expect(arr).toEqual(arrCopy);
  });
});

describe("getRandomCoordinatesExcludingBorder", () => {
  test("throws for invalid borderRatio < 0", () => {
    expect(() => getRandomCoordinatesExcludingBorder(100, 100, -0.1)).toThrow();
  });
  test("throws for invalid borderRatio >= 0.5", () => {
    expect(() => getRandomCoordinatesExcludingBorder(100, 100, 0.5)).toThrow();
  });
  test("returns x and y between 0-100", () => {
    for (let i = 0; i < 10; i++) {
      const { x, y } = getRandomCoordinatesExcludingBorder(200, 100, 0.1);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });
});

describe("randomRotation", () => {
  test("returns one of 90, 180, 270", () => {
    const valid = [90, 180, 270];
    for (let i = 0; i < 10; i++) {
      const val = randomRotation();
      expect(valid).toContain(val);
    }
  });
});

// --------------------- Mock ---------------------
/* jest.mock("../services/championService", () => ({
  getRandomChampion: jest.fn(() => ({ name: "TestChamp" })),
  getAllChampions: jest.fn(() => [{ name: "TestChamp" }]),
})); */
/* 
jest.mock("../services/sessionHelpers", () => ({
  getCompletionFlags: jest.fn(() => ({ flag: true })),
})); */

// --------------------- Controller functions ---------------------

// --------------------- Classic ---------------------
describe("Classic Controller Tests", () => {
  test("GET /classic initializes session and POST /classic with correct guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    // Initialize session and extract targetName
    const getResponse = await agent.get("/classic").expect(200).expect("Content-Type", /html/);
    const $ = load(getResponse.text);
    const classicTargetName = $('input[name="targetName"]').val();

    // Use the extracted targetName in the POST request
    const postResponse = await agent.post("/classic").send({ guessName: classicTargetName }).expect(200);

    expect(postResponse.body).toMatchObject({
      isCorrect: true,
      guessCount: 1,
      icon: expect.any(String),
    });
  });

  test("POST /classic handles incorrect guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/classic");

    const response = await agent.post("/classic").send({ guessName: "Teemo" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      isCorrect: false,
      guessCount: 1,
      icon: expect.any(String),
    });
  });

  test("POST /classic rejects invalid input", async () => {
    const response = await request(app).post("/classic").send({ badData: "test" }).expect(400);

    expect(response.body.errors).toBeInstanceOf(Array);
  });
});

// --------------------- Quote ---------------------
describe("Quote Controller Tests", () => {
  test("GET /quote initializes session", async () => {
    const response = await request(app).get("/quote").expect(200).expect("Content-Type", /html/);

    expect(response.text).toContain("targetName");
    expect(response.text).toContain("targetQuote");
  });

  test("POST /quote handles correct guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/quote");

    const response = await agent.post("/quote").send({ guessName: "Lux", targetName: "Lux" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: true,
      guessCount: 1,
      guessName: "Lux",
      icon: expect.any(String),
    });
  });

  test("POST /quote handles incorrect guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/quote");

    const response = await agent.post("/quote").send({ guessName: "Teemo", targetName: "Lux" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: false,
      guessCount: 1,
      guessName: "Teemo",
      icon: expect.any(String),
    });
  });

  test("POST /quote rejects invalid input", async () => {
    const response = await request(app).post("/quote").send({ badData: "test" }).expect(400);

    expect(response.body.errors).toBeInstanceOf(Array);
  });
});

// --------------------- Ability ---------------------
describe("Ability Controller Tests", () => {
  test("GET /ability initializes session", async () => {
    const response = await request(app).get("/ability").expect(200).expect("Content-Type", /html/);

    expect(response.text).toContain("targetName");
    expect(response.text).toContain("targetAbilityImage");
  });

  test("POST /ability handles correct guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/ability");

    const response = await agent.post("/ability").send({ guessName: "Lux", targetName: "Lux" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: true,
      guessCount: 1,
      guessName: "Lux",
      icon: expect.any(String),
    });
  });

  test("POST /ability handles incorrect guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/ability");

    const response = await agent.post("/ability").send({ guessName: "Teemo", targetName: "Lux" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: false,
      guessCount: 1,
      guessName: "Teemo",
      icon: expect.any(String),
    });
  });

  test("POST /ability rejects invalid input", async () => {
    const response = await request(app).post("/ability").send({ badData: "test" }).expect(400);

    expect(response.body.errors).toBeInstanceOf(Array);
  });

  // --------------------- Ability Key ---------------------

  test("POST /ability/key handles correct guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    const getResponse = await agent.get("/ability").expect(200).expect("Content-Type", /html/);
    const $ = load(getResponse.text);
    const abilityKey = $('input[name="targetAbilityKey"]').val();
    //initialize session
    await agent.get("/ability");

    const response = await agent.post("/ability/key").send({ guessKey: abilityKey }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: true,
    });
  });

  test("POST /ability/key handles incorrect guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/ability");

    const response = await agent.post("/ability/key").send({ guessKey: "R" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: false,
    });
  });

  test("POST /ability/key handles invalid guess", async () => {
    const response = await request(app).post("/ability/key").send({ badData: "test" }).expect(400);

    expect(response.body.errors).toBeInstanceOf(Array);
  });

  // --------------------- Ability Name ---------------------
  test("POST /ability/name handles correct guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    const getResponse = await agent.get("/ability").expect(200).expect("Content-Type", /html/);
    const $ = load(getResponse.text);
    const abilityName = $('input[name="targetAbilityName"]').val();
    //initialize session
    await agent.get("/ability");

    const response = await agent.post("/ability/name").send({ guessName: abilityName }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: true,
    });
  });

  test("POST /ability/name handles incorrect guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/ability");

    const response = await agent.post("/ability/name").send({ guessName: "Final Spark" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: false,
    });
  });

  test("POST /ability/name handles invalid guess", async () => {
    const response = await request(app).post("/ability/name").send({ badData: "test" }).expect(400);

    expect(response.body.errors).toBeInstanceOf(Array);
  });
});

// --------------------- Emoji ---------------------
describe("Emoji Controller Tests", () => {
  test("GET /emoji initializes session", async () => {
    const response = await request(app).get("/emoji").expect(200).expect("Content-Type", /html/);

    expect(response.text).toContain("targetName");
    expect(response.text).toContain("targetEmojis");
  });

  test("POST /emoji handles correct guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/emoji");

    const response = await agent.post("/emoji").send({ guessName: "Lux", targetName: "Lux" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: true,
      guessCount: 1,
      guessName: "Lux",
      icon: expect.any(String),
    });
  });

  test("POST /emoji handles incorrect guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/emoji");

    const response = await agent.post("/emoji").send({ guessName: "Teemo", targetName: "Lux" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: false,
      guessCount: 1,
      guessName: "Teemo",
      icon: expect.any(String),
    });
  });

  test("POST /emoji rejects invalid input", async () => {
    const response = await request(app).post("/emoji").send({ badData: "test" }).expect(400);

    expect(response.body.errors).toBeInstanceOf(Array);
  });
});

// --------------------- Splash ---------------------
describe("Splash Controller Tests", () => {
  test("GET /splash initializes session", async () => {
    const response = await request(app).get("/splash").expect(200).expect("Content-Type", /html/);

    expect(response.text).toContain("targetName");
    expect(response.text).toContain("splashImage");
    expect(response.text).toContain("splashTarget");
  });

  test("POST /splash handles correct guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/splash");

    const response = await agent.post("/splash").send({ guessName: "Lux", targetName: "Lux" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: true,
      guessCount: 1,
      guessName: "Lux",
      icon: expect.any(String),
    });
  });

  test("POST /splash handles incorrect guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/splash");

    const response = await agent.post("/splash").send({ guessName: "Teemo", targetName: "Lux" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: false,
      guessCount: 1,
      guessName: "Teemo",
      icon: expect.any(String),
    });
  });

  test("POST /splash rejects invalid input", async () => {
    const response = await request(app).post("/splash").send({ badData: "test" }).expect(400);

    expect(response.body.errors).toBeInstanceOf(Array);
  });

  // --------------------- Splash Name ---------------------
  test("POST /splash/name handles correct guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    const getResponse = await agent.get("/splash").expect(200).expect("Content-Type", /html/);
    const $ = load(getResponse.text);
    const splashName = $('input[name="targetName"]').val();
    //initialize session
    await agent.get("/splash");

    const response = await agent.post("/splash/name").send({ guessSplash: splashName }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: true,
    });
  });

  test("POST /splash/name handles incorrect guess", async () => {
    const agent = request.agent(app); // Preserves cookies

    //initialize session
    await agent.get("/splash");

    const response = await agent.post("/splash/name").send({ guessSplash: "Commando" }).expect(200);

    // Basic response validation
    expect(response.body).toMatchObject({
      correct: false,
    });
  });

  test("POST /splash/name handles invalid guess", async () => {
    const response = await request(app).post("/splash/name").send({ badData: "test" }).expect(400);

    expect(response.body.errors).toBeInstanceOf(Array);
  });
});
