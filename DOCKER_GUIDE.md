# RockDB Docker Setup Guide

This guide provides step-by-step instructions to build, run, and verify the RockDB application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Step 1: Configuration

Ensure you have a `.env` file in the root directory with the necessary encryption key:

```bash
ENCRYPTION_KEY=your_secret_key_here
```

## Step 2: Build the Docker Image

Build the RockDB backend image locally using the provided `Dockerfile`:

```bash
docker build -t rockdb-app .
```

*Note: The build process handles system dependencies (Python 3.11, Oracle Linux utilities) and installs the required Python packages.*

## Step 3: Run with Docker Compose

Use Docker Compose to start the application along with any required services (like the Oracle Observability Exporter, which is bundled in the same image).

```bash
docker-compose up -d --build
```

### What this does:
1.  **Rebuilds the image** if any changes were made.
2.  **Creates a volume** `rockdb_data` for persistent storage of the SQLite database.
3.  **Mounts the `./sql` folder** into the container for easy script management.
4.  **Starts the container** named `rockdb_app`.

## Step 4: Verification

### Check Container Status
```bash
docker ps
```
You should see `rockdb_app` running and mapping port `8080`.

### Check Logs
```bash
docker logs rockdb_app
```
Look for:
- `Initial database missing... Copying seed...` (on first run)
- `INFO: Uvicorn running on http://0.0.0.0:8080`

### Test Health Endpoint
```bash
curl http://localhost:8080/api/health
```
Expected response: `{"status":"ok","message":"Backend is ready"}`

## Step 5: Managing the Application

- **Stop the container**: `docker-compose down`
- **View logs in real-time**: `docker logs -f rockdb_app`
- **Access the container shell**: `docker exec -it rockdb_app /bin/bash`

## Persistence Notes

- **Database**: Stored in the `rockdb_data` Docker volume. It will persist even if the container is removed.
- **SQL Scripts**: Mapped to your local `./sql` directory. Any changes you make locally will be immediately visible inside the container.
