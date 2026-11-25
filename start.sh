#!/bin/bash
set -e

# If Render or another cloud provider injects PORT, configure Nginx to listen on it.
# Otherwise, default to 2927 for local Docker and standard deployments.
EXTERNAL_PORT=${PORT:-2927}

echo "Configuring Nginx to listen on external port ${EXTERNAL_PORT}..."
sed -i "s/listen [0-9]\+;/listen ${EXTERNAL_PORT};/g" /etc/nginx/nginx.conf

# Start FastAPI backend on internal port 8000
export PORT=8000
echo "Starting FastAPI backend on internal port 8000..."
python3 server.py &
BACKEND_PID=$!

# Start Nginx in foreground to serve frontend and proxy API
echo "Starting Nginx on external port ${EXTERNAL_PORT}..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Forward exit signals
trap "kill -TERM $BACKEND_PID $NGINX_PID" SIGTERM SIGINT

wait -n $BACKEND_PID $NGINX_PID || true

