FROM node:20-alpine AS base

WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app .

EXPOSE 80

CMD ["npm", "start"]