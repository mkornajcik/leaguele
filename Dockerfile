# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./

# Install all dependencies
RUN npm ci --include=dev

# Copy source files
COPY . .

# Build TypeScript and process Tailwind
RUN npm run build && npm run build:css

# Production stage
FROM node:22-alpine
WORKDIR /app

# Copy production files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/public ./src/public

# Install only production dependencies
RUN npm ci --omit=dev

# Environment variables
ENV NODE_ENV=production
EXPOSE 3000

# Start command
CMD ["npm", "run", "prod"]
