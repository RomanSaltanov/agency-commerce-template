FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .
ENV DISABLE_MEDUSA_ADMIN=false
RUN node_modules/.bin/medusa build

ENV NODE_ENV=production

WORKDIR /app/.medusa/server

EXPOSE 9000

CMD ["/app/node_modules/.bin/medusa", "start"]
