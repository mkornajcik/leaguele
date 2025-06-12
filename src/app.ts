import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import indexRoutes from "./routes/indexRoutes.js";
import { AppError } from "./types/appError.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Start express app
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get env
dotenv.config();

// Use JSON
app.use(express.json());

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
} else if (process.env.NODE_ENV === "production") {
  secure = true;
}

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  helmet.contentSecurityPolicy({
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
  })
);

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction) => {
    next(new AppError("Too many requests, please try again later.", 429));
  },
});

// Apply rate limiter to all requests
app.use(limiter);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // dont save session if unmodified
    saveUninitialized: false, // dont create session until something stored
    cookie: {
      secure: secure,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
    },
  })
);

// Routes
app.use("/", indexRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  return next(new AppError("Not found", 404));
});

//TODO: Error handling in prod
app.use(globalErrorHandler);

// Create HTTP server
const port = parseInt(process.env.PORT!, 10) || 3000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
