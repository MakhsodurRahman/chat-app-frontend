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

# Copy build output (React/Vite -> dist OR CRA -> build)
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]