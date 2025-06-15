import request from "supertest";
import app from "../app";
import { shuffleArray, getRandomCoordinatesExcludingBorder, randomRotation } from "./championsController";
import * as dailyChampions from "../services/dailyChampions.js";
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
    beforeEach(() => {
        jest.spyOn(dailyChampions, "getDailyChampions").mockReturnValue({
            date: dailyChampions.getTodayParis(),
            classicToday: "Lux",
            quoteToday: "Lux",
            abilityToday: { champion: "Lux", key: "Q", name: "Light Binding" },
            splashToday: "Lux",
            emojiToday: "Lux",
        });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    test("GET /classic initializes session", async () => {
        const response = await request(app).get("/classic").expect(200).expect("Content-Type", /html/);
        expect(response.text).toContain("targetName");
    });
    test("POST /classic handles correct guess", async () => {
        const agent = request.agent(app); // Preserves cookies
        //initialize session
        await agent.get("/classic");
        const response = await agent.post("/classic").send({ guessName: "Lux" }).expect(200);
        // Basic response validation
        expect(response.body).toMatchObject({
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
    beforeEach(() => {
        jest.spyOn(dailyChampions, "getDailyChampions").mockReturnValue({
            date: dailyChampions.getTodayParis(),
            classicToday: "Lux",
            quoteToday: "Lux",
            abilityToday: { champion: "Lux", key: "Q", name: "Light Binding" },
            splashToday: "Lux",
            emojiToday: "Lux",
        });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
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
    beforeEach(() => {
        jest.spyOn(dailyChampions, "getDailyChampions").mockReturnValue({
            date: dailyChampions.getTodayParis(),
            classicToday: "Lux",
            quoteToday: "Lux",
            abilityToday: {
                champion: "Lux",
                key: "Q",
                name: "Light Binding",
                allAbilities: ["Illumination", "Light Binding", "Prismatic Barrier", "Lucent Singularity", "Final Spark"],
                icon: "https://cdn.communitydragon.org/latest/champion/Lux/ability-icon/q",
            },
            splashToday: "Lux",
            emojiToday: "Lux",
        });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
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
        //initialize session
        await agent.get("/ability");
        const response = await agent.post("/ability/key").send({ guessKey: "Q" }).expect(200);
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
        //initialize session
        await agent.get("/ability");
        const response = await agent.post("/ability/name").send({ guessName: "Light Binding" }).expect(200);
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
    beforeEach(() => {
        jest.spyOn(dailyChampions, "getDailyChampions").mockReturnValue({
            date: dailyChampions.getTodayParis(),
            classicToday: "Lux",
            quoteToday: "Lux",
            abilityToday: {
                champion: "Lux",
                key: "Q",
                name: "Light Binding",
                allAbilities: ["Illumination", "Light Binding", "Prismatic Barrier", "Lucent Singularity", "Final Spark"],
                icon: "https://cdn.communitydragon.org/latest/champion/Lux/ability-icon/q",
            },
            splashToday: "Lux",
            emojiToday: { champion: "Lux", emojis: ["💡", "🔦", "🌈", "🪄"] },
        });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
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
    beforeEach(() => {
        jest.spyOn(dailyChampions, "getDailyChampions").mockReturnValue({
            date: dailyChampions.getTodayParis(),
            classicToday: "Lux",
            quoteToday: "Lux",
            abilityToday: {
                champion: "Lux",
                key: "Q",
                name: "Light Binding",
                allAbilities: ["Illumination", "Light Binding", "Prismatic Barrier", "Lucent Singularity", "Final Spark"],
                icon: "https://cdn.communitydragon.org/latest/champion/Lux/ability-icon/q",
            },
            splashToday: {
                champion: "Lux",
                splashName: "Elementalist",
                splashImage: "https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/characters/lux/skins/skin07/images/lux_splash_uncentered_7.jpg",
                allSplashes: ["Original", "Sorceress", "Spellthief", "Commando", "Elementalist"],
            },
            emojiToday: { champion: "Lux", emojis: ["💡", "🔦", "🌈", "🪄"] },
        });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
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
        //initialize session
        await agent.get("/splash");
        const response = await agent.post("/splash/name").send({ guessSplash: "Elementalist" }).expect(200);
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
