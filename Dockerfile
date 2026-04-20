FROM nginx:stable-alpine

# Copy the pre-built dist folder from GitHub Actions
COPY dist /usr/share/nginx/html

# Copy the Nginx template and entrypoint script
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
