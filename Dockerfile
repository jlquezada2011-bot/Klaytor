# Multi-stage Dockerfile for Klaytor Digital Health Platform
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts and runtime dependencies
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
