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
COPY nginx.conf /etc/nginx/nginx.conf.template

EXPOSE 80

# Run envsubst to replace ${BACKEND_URL} but protect Nginx variables like $host
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
