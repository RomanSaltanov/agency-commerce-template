FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
ENV DISABLE_MEDUSA_ADMIN=false
RUN npm run build

# ─── Production image ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# medusa start resolves public/admin relative to CWD
# medusa build outputs to .medusa/server/public/admin
# so CWD must be .medusa/server
WORKDIR /app/.medusa/server

ENV NODE_ENV=production

COPY --from=builder /app/.medusa/server/package.json /app/.medusa/server/package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/.medusa/server .

EXPOSE 9000

CMD ["npx", "medusa", "start"]
