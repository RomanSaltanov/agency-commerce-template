FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
ENV DISABLE_MEDUSA_ADMIN=false
RUN npm run build

# ─── Production image ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# Keep .medusa intact so medusa start finds admin at .medusa/server/public/admin/
COPY --from=builder /app/.medusa ./.medusa
# medusa CLI looks for medusa-config.js in WORKDIR
COPY --from=builder /app/.medusa/server/medusa-config.js ./medusa-config.js

EXPOSE 9000

CMD ["npx", "medusa", "start"]
