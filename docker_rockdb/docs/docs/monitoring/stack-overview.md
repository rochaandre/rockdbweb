# Monitoring Stack Overview

RockDB integrates a comprehensive monitoring stack to provide deep visibility into Oracle database performance.

## Architecture

The stack consists of several interconnected components, all running as Docker containers:

1. **`rockdb-app`**: The core application, which also runs the **Oracle Database Observability Exporter**. It exposes metrics on port `9161`.
2. **Prometheus**: Scrapes metrics from the exporter and stores them in a time-series database.
3. **InfluxDB**: Used for long-term persistence of metrics and the **Time Machine** features.
4. **Grafana**: The visualization layer, providing dashboards based on data from Prometheus and InfluxDB.

## Persistence

All data is persisted using named Docker volumes:
- `rockdb_data`: SQLite database for application settings and connections.
- `influxdb_data`: Metrics and history.
- `prom_data`: Prometheus scrape data.
- `grafana_data`: Grafana configuration and dashboards.

## How it works

The backend application dynamically generates exporter configurations based on the connections you manage. This allows the exporter to monitor multiple databases simultaneously, feeding data into InfluxDB for historical analysis.
