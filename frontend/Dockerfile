# frontend/Dockerfile
# ==========================================
# Stage 1: Build React + Vite Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Build-time environment variables for Vite
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

# Copy package files first for better Docker layer cachin
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:1.27-alpine AS runner

# Remove default Nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK \
    --interval=15s \
    --timeout=5s \
    --start-period=20s \
    --retries=3 \
    CMD wget -q -O - http://127.0.0.1:80/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
