FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
# DISABLE_MEDUSA_ADMIN skips building the heavy React admin UI during Docker build
# Admin is served from the running container via the installed node_modules
ENV DISABLE_MEDUSA_ADMIN=false
RUN npm run build

# ─── Production image ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy lock file from builder so npm ci works even without a committed lock file
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.medusa ./.medusa

EXPOSE 9000

CMD ["node", ".medusa/server/index.js"]
