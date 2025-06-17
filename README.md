# Leaguele

**Live Demo:** [https://leaguele.up.railway.app/](https://leaguele.up.railway.app/)

Leaguele is a Wordle-like guessing game for League of Legends champions, based on Loldle. It offers multiple modes (classic, quote, ability, emoji, splash) where players guess the champion based on varying clues each day.

---

## Table of Contents

- [Features](#features)
- [Demo / Screenshots](#demo--screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Running in Development](#running-in-development)
- [Building & Production](#building--production)
- [Testing](#testing)
- [CI/CD (GitLab)](#cicd-gitlab)
- [Modes Overview](#modes-overview)
- [Assets & Attribution](#assets--attribution)
- [Security & Rate Limiting](#security--rate-limiting)
- [Disclaimer & Legal](#disclaimer--legal)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- Five game modes:
  - **Classic**: Guess the champion by comparing attributes and deducing the champion that fits all criteria.
  - **Quote**: Guess the champion from a random in-game quote or voice line.
  - **Ability**: Guess the champion based on an ability image.
  - **Emoji**: Decode an emoji sequence representing the champion.
  - **Splash**: Guess from a zoomed-in portion of the official splash art.
- Built with TypeScript, Express, EJS templates, Tailwind CSS.
- Session management with `express-session` and Redis (via `connect-redis` and `redis`).
- Daily champion assignment at midnight (Europe/Paris timezone) for each mode.
- Data stored in JSON files (included in the repo for free use).
- Tests for all endpoints using Jest and SuperTest.
- GitLab CI/CD pipeline: building Docker image, compiling TypeScript, building assets, running tests.
- Dockerized for easy local and production deployment.
- Rate limiting, input validation/sanitization, security headers via Helmet.
- Deployed on Railway with a linked Redis database.

---

## Demo / Screenshots



```markdown
![main](https://github.com/user-attachments/assets/d3c27b3b-2bfc-49db-8844-188dd60e0cb8)
![classic](https://github.com/user-attachments/assets/2c6d7a4e-ce53-4ee3-928b-1df5b1f8f554)
![quote](https://github.com/user-attachments/assets/d7967691-fa4b-4989-8550-4d6aa3cb3ad6)
![ability1](https://github.com/user-attachments/assets/55ece3d5-6521-46ca-b6e1-5f168ed9fe38)
![ability2](https://github.com/user-attachments/assets/0000f43b-b407-4b7c-9cce-98c537dd1338)
![emoji](https://github.com/user-attachments/assets/284a4a09-4ef5-445d-a660-0e8acd86bc98)
![splash](https://github.com/user-attachments/assets/23b009b4-9567-4192-b2bd-b255ea28d8ed)
```

---

## Tech Stack

- **Language & Runtime:** Node.js (TypeScript)
- **Web Framework:** Express 
- **Templating:** EJS
- **Styling:** Tailwind CSS, PostCSS
- **Session & Storage:** express-session, redis, ioredis
- **Scheduling / Date Handling:** Luxon
- **Testing:** Jest, SuperTest
- **Utilities:** express-validator, helmet, express-rate-limit, dotenv
- **CI/CD:** GitLab CI with Docker-in-Docker
- **Deployment:** Docker, Railway
- **Data Fetching (scripts):** node-fetch, cheerio, puppeteer, shelljs

---

## Prerequisites

- **Node.js**: version >= 18 (adjust if different).
- **npm** (scripts assume npm).
- **Docker**: for local Redis instance (optional but recommended) and building the app image.
- **Redis**: Used for session storage. For local development, run Redis in Docker:
  ```bash
  docker run -d --name leaguele-redis -p 6379:6379 redis
  ```

---


## Running in Development

- Start Redis locally (e.g., via Docker as above).
- Run the dev server with hot reload:
  ```bash
  npm run dev
  ```
- CSS changes: in another terminal, watch Tailwind CSS:
  ```bash
  npm run watch:css
  ```
- The server listens on `http://localhost:3000` (or your `PORT`).

---

## Building & Production

1. **Prebuild** (copy assets):
   ```bash
   npm run prebuild
   ```
2. **Compile TypeScript**:
   ```bash
   npm run build
   ```
3. **Build CSS**:
   ```bash
   npm run build:css
   ```
4. **Start**:
   ```bash
   npm start
   ```
   Ensure `NODE_ENV=production`, environment variables set, and Redis is accessible.

---

## Testing

- **Run tests**:
  ```bash
  npm run test
  ```
- For experimental VM modules in Jest:
  ```bash
  npm run test:exp
  ```
- Tests may require a running Redis instance or mocks depending on setup.

---

## CI/CD (GitLab)

The project includes `.gitlab-ci.yml` with stages:
1. **build_docker**: Build Docker image and save artifact.
2. **build_typescript**: Install dependencies and compile TypeScript.
3. **build_assets**: Install dependencies and build Tailwind CSS assets.
4. **test**: Install dependencies and run Jest tests.

---

## Modes Overview

1. **Classic**  
   The player makes guesses and receives feedback comparing champion attributes (roles, gender, resource etc.). Deduce the champion fitting all criteria.
2. **Quote**  
   A random champion quote or voice line is shown; the player matches it to the champion.
3. **Ability**  
   An ability description or hint is presented; guess which champion it belongs to.
4. **Emoji**  
   A sequence of emojis encodes hints about the champion or abilities; decode and guess the champion.
5. **Splash**  
   A zoomed-in/cropped portion of the official splash art is shown; guess the champion from the partial image.

Assets (images, emojis) are fetched at runtime from Riot’s CDN or Community Dragon CDN, avoiding redistribution of assets in the repo.

---

## Assets & Attribution

- **Data Sources**: Champion images and data come from Riot’s Data Dragon or Community Dragon CDN at runtime.
- **Attribution / Terms**: Follow Riot’s policies for asset usage. Fetch assets dynamically; do not commit or redistribute copyrighted assets.
- **Caching**: Serve images from CDN; you may add caching headers or use a caching layer, but ensure compliance.

---

## Security & Rate Limiting

- **Helmet** secures HTTP headers.
- **express-rate-limit** prevents abuse; configured in middleware.
- **express-validator** for input validation/sanitization.
- **Sessions**: Stored in Redis; ensure `SESSION_SECRET` is strong and kept secret.

---

## Disclaimer & Legal

Leagyele is heavily inspired by Loldle.

Leaguele is a fan-made project that uses assets and data owned by Riot Games. This project is not endorsed, sponsored, or affiliated with Riot Games. Use of Riot assets and data is subject to Riot’s policies:

> “Leaguele was created under Riot Games’ ‘Legal Jibber Jabber’ policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.”  

---

## License

This project is open source under the MIT License. See [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Riot Games** for providing Data Dragon and API (used in scripts).
- **Community Dragon CDN** for assets.
- Inspiration from Loldle.
- Open-source libraries and tools used throughout.

---
