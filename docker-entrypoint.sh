#!/bin/sh
set -e

# Run envsubst on our template and output to the standard Nginx config path
# We only substitute ${BACKEND_URL} to protect internal Nginx variables like $host
envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Execute the original CMD (usually nginx -g 'daemon off;')
exec "$@"
