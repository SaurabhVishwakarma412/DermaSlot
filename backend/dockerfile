FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application code
COPY . .

# Ensure uploads directory exists and permissions are set
RUN mkdir -p uploads/cases && chown -R node:node /app

# Run as non-privileged user for security
USER node

EXPOSE 5000

# Healthcheck probe using built-in wget in Alpine
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O - http://localhost:5000/healthz || exit 1

CMD ["node", "src/server.js"]
