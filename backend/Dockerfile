# backend/Dockerfile

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

RUN mkdir -p uploads/cases && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O - http://localhost:5000/healthz || exit 1

CMD ["node", "src/server.js"]
