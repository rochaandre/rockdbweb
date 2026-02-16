# System Architecture

RockDB is built with a modern, decoupled architecture to ensure scalability and ease of deployment.

## Components

### 1. Frontend (React + Vite)
- User dashboard for real-time visualization.
- Configuration management for database connections.
- Integrated with Shadcn/UI for a premium look and feel.

### 2. Backend (FastAPI + Python)
- High-performance API layer.
- Manages connection pools and authentication.
- Dynamically generates monitoring configurations.

### 3. Database Layer
- **SQLite**: Local persistent storage for application metadata.
- **InfluxDB**: High-performance time-series database for monitoring metrics.

### 4. Observability Layer
- **Oracle Observability Exporter**: Scrapes specialized metrics from target Oracle instances.
- **Prometheus**: Aggregates and scrapes metrics from the exporter.
- **Grafana**: Advanced visualization and alerting.
