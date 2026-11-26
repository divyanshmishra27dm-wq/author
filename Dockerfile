# ==============================================================================
# Stage 1: Build Frontend Assets (React + Vite + Tailwind CSS)
# ==============================================================================
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Cache package installation
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build production bundle
COPY tsconfig*.json vite.config.ts index.html ./
COPY src ./src
COPY public ./public
RUN npm run build

# ==============================================================================
# Stage 2: Production Server (Frontend on 2927 via Nginx, Backend on 8000 via FastAPI)
# ==============================================================================
FROM python:3.11-slim AS runtime

# Copy Astral uv binary for high-speed package installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Prevent Python from writing .pyc files & buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1 \
    PORT=8000

WORKDIR /app

# Install minimal system dependencies & Nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages using uv
COPY requirements.txt ./
RUN uv pip install --system --no-cache -r requirements.txt

# Copy .env file into the container
COPY .env* ./

# Copy application files
COPY converter.py server.py ./
COPY ref_scorm ./ref_scorm
COPY public ./public

# Copy compiled frontend from Stage 1 into dist/
COPY --from=frontend-builder /app/dist ./dist

# Copy Nginx configuration for serving frontend on port 2927 and proxying to backend
COPY nginx.conf /etc/nginx/nginx.conf

# Ensure media & slides directories exist and are mirrored to dist for Nginx
RUN mkdir -p /app/public/media /app/dist/media /app/public/slides /app/dist/slides /app/public/scorm_player /app/dist/scorm_player && \
    (cp -rf /app/public/slides/* /app/public/media/ 2>/dev/null || true) && \
    (cp -rf /app/public/media/* /app/dist/media/ 2>/dev/null || true) && \
    (cp -rf /app/public/slides/* /app/dist/slides/ 2>/dev/null || true) && \
    ln -sf /app/dist/media /app/dist/scorm_player/media && \
    ln -sf /app/dist/slides /app/dist/scorm_player/slides && \
    ln -sf /app/public/media /app/public/scorm_player/media && \
    ln -sf /app/public/slides /app/public/scorm_player/slides

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Expose Frontend (2927) and Backend (8000)
EXPOSE 2927 8000

# Healthcheck to monitor backend availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start Nginx and FastAPI dynamically adapting to Render's $PORT or 2927
CMD ["./start.sh"]
