# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Arguments for build-time environment variables in Vite
ARG VITE_API_URL
ARG VITE_SOCKET_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy source files
COPY . .

# Build production bundle
RUN npm run build

# Production runtime stage with lightweight Nginx Alpine
FROM nginx:1.27-alpine AS runner

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration with SPA routing and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck probe for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
