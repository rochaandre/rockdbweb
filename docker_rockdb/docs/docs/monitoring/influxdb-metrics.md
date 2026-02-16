# InfluxDB & Metrics

RockDB uses InfluxDB as its primary engine for time-series data, enabling both the **Time Machine** features and long-term performance history.

## Data Storage

Metrics are stored in the `timemachine` bucket within the `rockdb` organization.

### Collected Data Types

1. **Session Metrics**: CPU usage, I/O wait, logical reads, and physical writes per session.
2. **SQL Performance**: Execution times, buffer gets, and disk reads for specific SQL IDs.
3. **Wait Events**: Top wait events across the database instance.

## Time Machine Integration

The Time Machine worker in the backend periodically snapshots critical performance views and pushes them to InfluxDB. 

- **Retention**: By default, data is kept for 30 days (`DOCKER_INFLUXDB_INIT_RETENTION=30d`).
- **Querying**: You can use the InfluxDB UI on port `8086` to run custom Flux queries or use the pre-configured Grafana dashboards.

## Configuring Custom Metrics

If you wish to add custom metrics, you can modify the `.toml` files located in the `rockdb_app/` configuration volume. These will be picked up by the exporter and sent to InfluxDB via Prometheus.
