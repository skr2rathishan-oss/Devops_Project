FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./


FROM base AS dev

RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npx", "nodemon", "--legacy-watch", "server.js"]


FROM base AS prod

ENV NODE_ENV=production

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

USER node

EXPOSE 5000

CMD ["node", "server.js"]
