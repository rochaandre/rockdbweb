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

## Updating the Application

When you make changes to your Python code (`backend/`) or your SQL scripts (`sql/`), you need to decide how to update the running container:

### 1. Updating SQL Scripts
Since the `./sql` folder is **mounted as a volume**, any changes you make locally are reflected **immediately** inside the container. You do NOT need to rebuild the image or restart the container for new SQL scripts.

### 2. Updating Python Code
If you modify files in the `backend/` directory, you must rebuild the image and restart the container to apply the changes:

```bash
docker-compose up -d --build
```

**What happens behind the scenes?**
- Docker detects that the `backend/` folder has changed.
- It invalidates the cache from the `COPY backend /app/backend` step.
- It rebuilds ONLY the layers from that point onward (this is very fast).
- It recreates and restarts the container with the new code.

### 3. Adding New Dependencies
If you add a new library to `backend/requirements.txt`, running `docker-compose up -d --build` will also trigger a re-installation of all Python packages.

## Creating the Environment from Scratch

If you need to recreate this setup from zero, follow these steps and design choices:

### 1. Choosing the Base Template
We use the **Oracle Database Observability Exporter** as our base image (`container-registry.oracle.com/database/observability-exporter:2.2.1`).

**Why this template?**
- Pre-configured with **Oracle Linux 8**.
- Includes the **Oracle Instant Client** libraries required for `oracledb`.
- Contains the `oracledb_exporter` binary for database metrics.

### 2. Manual Reconstruction Steps

If you were starting from an empty folder, the process would be:

1.  **Initialize the Dockerfile**:
    - Start `FROM` the exporter image.
    - Switch to `USER root` to install Python.
    - Use `microdnf` (the package manager for Oracle Linux) to install `python3.11` and `pip`.

2.  **Configure Python**:
    - Use `alternatives` to ensure `python3` points to the new version.
    - Upgrade `pip`, `setuptools`, and `wheel`.

3.  **Dependency Strategy**:
    - Copy only `backend/requirements.txt` first. This allows Docker to cache the heavy installation step.
    - Install dependencies using `pip3 install -r requirements.txt`.

4.  **Application Layer**:
    - Copy your `backend/` source, `sql/` scripts, and the `rockdb.sqlite` seed file.
    - Create the persistence directory `/opt/rockdbweb` and set ownership to UID `1000` (the default non-root user in the template).

5.  **Multi-Process Management**:
    - Since Docker containers usually run one process, we create a `start.sh` script to launch both the `oracledb_exporter` and our `uvicorn` backend.
    - Use `&` to run the exporter in the background.

6.  **Entrypoint Fix (Critical)**:
    - The base image has its own `ENTRYPOINT`. To use our `start.sh` as the main command, we MUST clear it with `ENTRYPOINT []`.

### 3. Re-assembling the Pieces

By combining these steps, the `Dockerfile` in this repo acts as a complete blueprint. You can simply copy its content and run `docker build` to have a production-ready environment instantly.

## Persistence Notes

- **Database**: Stored in the `rockdb_data` Docker volume. It will persist even if the container is removed.
- **SQL Scripts**: Mapped to your local `./sql` directory. Any changes you make locally will be immediately visible inside the container.
