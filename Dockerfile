# Stage 1: Build client static files
FROM node:20-alpine AS client-builder
WORKDIR /client
COPY client/package.json client/package-lock.json* ./
RUN npm ci --ignore-scripts
COPY client/ ./
RUN npm run build

# Stage 2: Install backend dependencies and generate Prisma client
FROM node:20-alpine AS deps
WORKDIR /server
COPY server/package.json server/package-lock.json* ./
RUN npm ci --ignore-scripts
COPY server/prisma ./prisma
RUN npx prisma generate

# Stage 3: Build backend
FROM node:20-alpine AS builder
WORKDIR /server
COPY server/package.json server/package-lock.json* ./
COPY --from=deps /server/node_modules ./node_modules
COPY --from=deps /server/prisma ./prisma
COPY server/src ./src
COPY server/prisma ./prisma
COPY server/tsconfig*.json ./
COPY server/nest-cli.json ./
RUN npm run build

# Stage 4: Production image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /server/package.json ./
COPY --from=builder /server/node_modules ./node_modules
COPY --from=builder /server/dist ./dist
COPY --from=builder /server/prisma ./prisma
COPY --from=builder /server/prisma/migrations ./prisma/migrations
# Copy client build to /app/client/out (separate folder)
COPY --from=client-builder /client/out ./client/out

EXPOSE 4200
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4200/health || exit 1

CMD npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/src/main.js
