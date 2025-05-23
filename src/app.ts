import express, { NextFunction, Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";

// Start express app
const app = express();

// Get env
dotenv.config({ path: "./config.env" });

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Create HTTP server
const port = parseInt(process.env.PORT!, 10) || 3000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
