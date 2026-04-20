# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Use the templates directory for automatic environment variable substitution
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
# Use the official Nginx entrypoint (no manual CMD needed for envsubst)
CMD ["nginx", "-g", "daemon off;"]
