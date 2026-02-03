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

## Distribuição e Versionamento

Para distribuir o RockDB para outras empresas ou pessoas, você deve utilizar o conceito de **Tags** e **Registries** (como Docker Hub ou Google Artifact Registry).

### 1. Versionando a Imagem
Não use apenas a tag `latest` para distribuição. Use números de versão para ter controle sobre o que cada cliente está rodando.

```bash
# Taggear uma versão específica (ex: v1.0.1)
docker tag rockdb-app rochaandre/rockdbweb:v1.0.1
```

### 2. Enviando para um Registry (Push)
Para que outras pessoas possam baixar a imagem, você precisa enviá-la para um repositório remoto:

```bash
# Efetuar login no Docker Hub (ou outro registry)
docker login

# Enviar a imagem
docker push rochaandre/rockdbweb:v1.0.1
```

### 3. Como o Cliente Utiliza
O cliente final não precisará do seu código-fonte, apenas do arquivo `docker-compose.yml` configurado para baixar a imagem pública/privada:

```yaml
services:
  rockdb-backend:
    image: rochaandre/rockdbweb:v1.0.1  # Baixa a imagem pronta
    ports:
      - "8080:8080"
    # ... volumes e envs ...
```

---

## Workflow de Atualização (Step-by-Step)

Sempre que você alterar o código-fonte (Python), siga este fluxo para atualizar a imagem e o container:

1.  **Rebuild da Imagem**: Comando para ler o `Dockerfile` e aplicar suas mudanças no binário da imagem.
    ```bash
    docker build -t rockdb-app .
    ```

2.  **Atualização do Container**: Comando para o Docker Compose perceber que a imagem `rockdb-app` mudou e recriar o container.
    ```bash
    docker-compose up -d
    ```

3.  **Limpeza (Opcional)**: Remova imagens antigas que ficaram sem nome (dangling images) para economizar espaço.
    ```bash
    docker image prune -f
    ```

> [!TIP]
> **Atalho**: Você pode realizar os passos 1 e 2 em um único comando:
> ```bash
> docker-compose up -d --build
> ```

### Quando NÃO é necessário rebuild?
- **Scripts SQL**: Se você apenas adicionou ou removeu arquivos na pasta `./sql`, **não precisa de nada**. O Docker já "enxerga" os arquivos novos automaticamente por causa do volume montado.
- **Configurações (.env)**: Se você mudar o `.env`, apenas reinicie o container: `docker-compose restart`.

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
