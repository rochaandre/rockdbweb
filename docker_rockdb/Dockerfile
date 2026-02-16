# --- Stage 1: Build the React Frontend ---
FROM node:18-slim AS build-frontend

WORKDIR /frontend

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# --- Stage 2: Final Image (Python Backend + Frontend) ---
# Use the Oracle Database Observability Exporter as the base image
FROM container-registry.oracle.com/database/observability-exporter:2.2.1

# Switch to root to install system dependencies
USER root

# Install Python 3.11, basic utilities, and connectivity tools
RUN microdnf install -y python3.11 python3.11-pip tar gzip iputils procps curl && \
    microdnf clean all

# Ensure python3 points to 3.11
RUN alternatives --set python3 /usr/bin/python3.11
RUN pip3 install --no-cache-dir --upgrade pip setuptools wheel

# Set up application directory
WORKDIR /app

# Copy the backend requirements first for better caching
COPY backend/requirements.txt /app/requirements.txt

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the application source code and scripts
COPY backend /app/backend
COPY sql /app/sql
COPY rockdb.sqlite /app/rockdb.sqlite

# Copy the built frontend from the first stage
COPY --from=build-frontend /frontend/dist /app/dist

# Create data directory and set permissions
RUN mkdir -p /opt/rockdbweb && \
    chown -R 1000:1000 /app /opt/rockdbweb

# Set environment variables for portability
ENV ROCKDB_DATA_DIR=/opt/rockdbweb
ENV ROCKDB_SCRIPTS_DIR=/app/sql
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose ports for RockDB Backend (8080) and Observability Exporter (9161)
EXPOSE 8080 9161

# Copy a startup script to run both services
COPY <<'EOF' /app/start.sh
#!/bin/bash
# Perform initial sync of exporter configuration from existing database
python3.11 -m backend.exporter_sync_mod

# Start the Oracle Observability Exporter in the background
# We pass any arguments from CMD to the exporter (like --config.file)
/oracledb_exporter "$@" &

# Database setup: copy seed if missing in the volume
if [ ! -f /opt/rockdbweb/rockdb.sqlite ]; then
    echo "Initial database missing in /opt/rockdbweb. Copying seed..."
    cp /app/rockdb.sqlite /opt/rockdbweb/rockdb.sqlite
fi

# Start the RockDB Backend using python3.11 directly to be sure
python3.11 -m uvicorn backend.main:app --host 0.0.0.0 --port 8080 --log-level info
EOF

RUN chmod +x /app/start.sh

# Switch back to the non-privileged user (if defined in base, or use 1000)
USER 1000

# Use start.sh as the entrypoint to handle command-line arguments correctly
ENTRYPOINT ["/app/start.sh"]

# Default to no additional arguments
CMD []
