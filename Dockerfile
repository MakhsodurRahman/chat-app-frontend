# =========================
# Production Nginx Stage
# =========================
FROM nginx:1.22.1-alpine AS prod-stage

# Copy pre-built dist (built on GitHub Actions)
COPY dist /usr/share/nginx/html

# Copy Nginx config (includes backend proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]