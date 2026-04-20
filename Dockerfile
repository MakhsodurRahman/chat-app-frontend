# =========================
# Stage 1: Build React App
# =========================
FROM node:22-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# =========================
# Stage 2: Production Nginx
# =========================
FROM nginx:1.22.1-alpine AS prod-stage

# Copy build output (Vite -> dist)
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy Nginx config (includes backend proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]