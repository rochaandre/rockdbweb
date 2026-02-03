# 📊 InfluxDB Infrastructure for RockDB

RockDB uses **InfluxDB 2.x** as a high-performance time-series database to power its **Time Machine** feature. It stores snapshots of database performance (sessions, SQL IDs, long ops) at 10-second intervals.

## 🐳 Docker Deployment

The InfluxDB service is managed via `docker-compose.yml` located in the project root.

### Quick Start
To start the InfluxDB container:
```bash
docker-compose up -d
```

To stop the container:
```bash
docker-compose down
```

## ⚙️ Configuration

The container is pre-configured with the following default credentials (defined in `docker-compose.yml`):

| Parameter | Value | Description |
|-----------|-------|-------------|
| **URL** | `http://localhost:8086` | Access port for API and Web UI |
| **Organization** | `rockdb` | Multi-tenancy grouping |
| **Bucket** | `timemachine` | Data container for time-series data |
| **Retention** | `30d` | Automatic data deletion after 30 days |
| **Admin User** | `admin` | Initial administrator username |
| **Password** | `rockdb_password123` | Initial administrator password |
| **Token** | `rockdb_super_secret_token_change_me` | API authentication token |

> [!IMPORTANT]  
> If you change these values in `docker-compose.yml`, you must also update the corresponding environment variables in the RockDB backend.

## 🖥️ Web Interface

InfluxDB provides a built-in UI for data exploration and monitoring:
1. Open `http://localhost:8086` in your browser.
2. Log in with the **Admin User** and **Password** listed above.
3. Navigate to **Data Explorer** to query manually using Flux.

## 💾 Data Persistence

By default, data is persisted in a Docker volume named `influxdb_data`. This ensures that your performance history is not lost if the container is restarted or recreated.

## 🛠️ Maintenance

### Checking Logs
If the Time Machine is not capturing data, check the container logs:
```bash
docker logs -f rockdb_influxdb
```

### Manual Data Purge
If you need to clear the history manually:
1. Log into the InfluxDB UI.
2. Go to **Buckets**.
3. Select the `timemachine` bucket and use the **Delete Data** tool.

### Changing Admin Password
To change the password for the `admin` user via CLI:
```bash
docker exec rockdb_influxdb influx user password --name admin -p nova_senha_123
```

---

## �️ Manual CLI Inspection (Inside Container)

You can use the `influx` CLI directly inside the running container to inspect the database.

### 1. List Buckets
```bash
docker exec rockdb_influxdb influx bucket list --org rockdb --token rockdb_super_secret_token_change_me
```

### 2. List Measurements (Tables equivalent)
InfluxDB doesn't have traditional tables. "Measurements" are the closest equivalent.
```bash
docker exec rockdb_influxdb influx query 'import "influxdata/influxdb/schema" schema.measurements(bucket: "timemachine")' --org rockdb --token rockdb_super_secret_token_change_me
```

### 3. Query Last 5 Minutes of Data
```bash
docker exec rockdb_influxdb influx query 'from(bucket:"timemachine") |> range(start:-5m) |> limit(n:10)' --org rockdb --token rockdb_super_secret_token_change_me
```

### 4. Continuous Tail (Monitoring writes)
```bash
# This will show you new data points as they arrive every 10 seconds
docker exec -it rockdb_influxdb influx query 'from(bucket:"timemachine") |> range(start:-1m)' --org rockdb --token rockdb_super_secret_token_change_me
```

---

---

## �🐿️ Connecting with DBeaver Community

To query the Time Machine data using DBeaver, follow these steps:

1.  **New Connection**: Click on "New Database Connection" and search for **InfluxDB**.
2.  **Connection Settings**:
    *   **Host**: `localhost`
    *   **Port**: `8086`
    *   **Organization** (in 'Database' field): `rockdb`
3.  **Authentication**:
    *   **User**: `admin`
    *   **Password**: Paste the **Token** here: `rockdb_super_secret_token_change_me`
4.  **Driver Properties**:
    *   Navigate to the **Driver Properties** tab.
    *   Ensure the property `apiToken` or `token` is set to the token value if the Password field doesn't work directly in your DBeaver version.
    *   For InfluxDB 2.x, some drivers require the `auth` property set to `token`.

> [!TIP]
> Once connected, you can browse the `timemachine` bucket and execute **Flux** queries to analyze historical workload patterns.

### ⚠️ Alternative: Manual Driver Setup (DBeaver Community)
If InfluxDB does not appear in your DBeaver version:

1.  **Download Driver**: Download the InfluxDB JDBC driver (`.jar`) version 0.2.6: [net.suteren.jdbc.influxdb/0.2.6](https://mvnrepository.com/artifact/net.suteren.jdbc.influxdb/influxdb-jdbc/0.2.6).
2.  **Driver Manager**:
    *   **Class Name**: `net.suteren.jdbc.influxdb.InfluxDbDriver`
    *   **URL Template**: `jdbc:influxdb:http://{host}:{port}?org=rockdb&bucket={database}&auth_type=token`
4.  **Libraries**: Click `Add File` and select the downloaded `.jar`.
5.  **Finish**: Click `Find Class` and then `OK`.

### 🔌 Establishing the Connection
Once the driver is created:
1.  **Host**: `localhost`
2.  **Port**: `8086`
3.  **Database** (Bucket): `timemachine`
4.  **Driver Properties** (Crucial Step):
    Navigate to the **Driver Properties** tab and add/edit the following:
    *   `org` : `rockdb`
    *   `auth_type` : `token`
    *   `token` : `rockdb_super_secret_token_change_me`
    *   `Token` : `rockdb_super_secret_token_change_me`

### ❌ Troubleshooting: "FluxTable definition was not found"
If you see this error when trying to browse the database:

1.  **Empty Response**: This often happens if the driver executes a query that returns no data. Ensure the Time Machine has been running for at least 30 seconds to populate the initial records.
2.  **Organization Match**: Verify that the `org` property in DBeaver **exactly matches** the one in `docker-compose.yml` (`rockdb`).
3.  **URL Format**: Some driver versions prefer the organization in the URL:
    `jdbc:influxdb://localhost:8086/timemachine?org=rockdb`
4.  **Metadata Query**: DBeaver tries to "explore" the schema. Try opening a **SQL Editor** and running a simple Flux query directly to see if it works:
    ```flux
    from(bucket: "timemachine") |> range(start: -5m) |> limit(n:10)
    ```

### ✅ Verified Working URL Configuration
For the `net.suteren.jdbc.influxdb` driver, use this specific template:
`jdbc:influxdb:http://localhost:8086?org=rockdb&bucket=timemachine&auth_type=token`

(The **Token** must be provided in the **Driver Properties** tab as shown in the previous section).

> [!TIP]
> For the most reliable experience with InfluxDB 2.x, use the **Native Web UI** at `http://localhost:8086`. It provides excellent visualization tools (Data Explorer) that are purpose-built for Flux.
