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
- **Access the container shell**: `docker exec -it rockdb_app /bin/bash`

## Distribution and Versioning

To distribute RockDB to other companies or individuals, you should use the concept of **Tags** and **Registries** (such as Docker Hub or Google Artifact Registry).

### 1. Versioning the Image
Do not use only the `latest` tag for distribution. Use version numbers to have control over what each client is running.

```bash
# Tag a specific version (example: v1.0.1)
docker tag rockdb-app rochaandre/rockdbweb:v1.0.1
```

### 2. Pushing to a Registry
For others to be able to download the image, you need to send it to a remote repository:

```bash
# Log in to Docker Hub (or another registry)
docker login

# Push the image
docker push rochaandre/rockdbweb:v1.0.1
```

### 3. How the Client Uses It
The end client will not need your source code, only the `docker-compose.yml` file configured to download the public/private image:

```yaml
services:
  rockdb-backend:
    image: rochaandre/rockdbweb:v1.0.1  # Downloads the ready image
    ports:
      - "8080:8080"
    # ... volumes and envs ...
```

---

## Update Workflow (Step-by-Step)

Whenever you change the source code (Python), follow this flow to update the image and the container:

1.  **Image Rebuild**: Command to read the `Dockerfile` and apply your changes to the image binary.
    ```bash
    docker build -t rockdb-app .
    ```

2.  **Container Update**: Command for Docker Compose to notice that the `rockdb-app` image has changed and recreate the container.
    ```bash
    docker-compose up -d
    ```

3.  **Cleanup (Optional)**: Remove old images that are left without a name (dangling images) to save space.
    ```bash
    docker image prune -f
    ```

> [!TIP]
> **Shortcut**: You can perform steps 1 and 2 in a single command:
> ```bash
> docker-compose up -d --build
> ```

### When is a rebuild NOT necessary?
- **SQL Scripts**: If you only added or removed files in the `./sql` folder, **you don't need anything**. Docker already "sees" the new files automatically because of the mounted volume.
- **Configurations (.env)**: If you change the `.env`, just restart the container: `docker-compose restart`.

## Criando o Ambiente do Zero (The Template Approach)

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
