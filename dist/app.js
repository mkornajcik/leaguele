import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import path from "path";
import fs from "fs";
import indexRoutes from "./routes/indexRoutes.js";
import { AppError } from "./types/appError.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
// Start express app
const app = express();
let viewsDir = path.join(process.cwd(), "dist", "views");
if (!fs.existsSync(viewsDir)) {
    viewsDir = path.join(process.cwd(), "src", "views");
}
// Get env
dotenv.config();
// Use JSON
app.use(express.json());
// Set EJS
app.set("views", viewsDir);
app.set("view engine", "ejs");
// Static files and body parser
app.use(express.static("dist/public"));
app.use(express.urlencoded({ extended: true }));
if (!process.env.SESSION_SECRET) {
    console.error("SESSION_SECRET not defined");
    process.exit(1);
}
let secure = false;
if (process.env.NODE_ENV === "development") {
    secure = false;
}
else if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    secure = true;
}
// Redis setup
if (!process.env.REDIS_URL) {
    console.error("REDIS_URL not defined");
    process.exit(1);
}
const redisUrl = process.env.REDIS_URL;
const redisClient = createClient({ url: redisUrl });
redisClient.on("error", (err) => {
    console.error("Redis client error:", err);
});
redisClient.connect().catch(console.error);
app.use(helmet({
    crossOriginEmbedderPolicy: false,
}));
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
            "'self'",
            "data:",
            "https://ddragon.leagueoflegends.com/",
            "https://cdn.communitydragon.org/",
            "https://raw.communitydragon.org/",
        ],
        connectSrc: ["'self'", "https://api.example.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    },
}));
// rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new AppError("Too many requests, please try again later.", 429));
    },
});
// Apply rate limiter to all requests
app.use(limiter);
// Session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        //secure: secure,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "lax",
    },
}));
// Routes
app.use("/", indexRoutes);
// 404 handler
app.use((req, res, next) => {
    return next(new AppError("Not found", 404));
});
app.use(globalErrorHandler);
export default app;
