# Deploying Oracle AI Database Metrics Exporter as a Standalone Binary

This guide provides a simplified, step-by-step approach to installing and configuring the **AI Database Metrics Exporter** (based on OpenTelemetry) in standalone mode. 

## Prerequisites

The following environment was used for this setup:
- **OS:** Oracle Linux Server 8.10 (Kernel 5.15)
- **Database:** Oracle Database 19c (Enterprise Edition)

### Initial Server Preparation

First, install essential utilities and set up the hostname:

```bash
# Update and install dependencies
dnf install wget zip unzip rsync net-tools mlocate -y
updatedb

# Configure the hostname
hostnamectl set-hostname srvexporter.local
# (Optional) Reboot to apply hostname changes: init 6
```

Update your `/etc/hosts` file with your server's IP:
```text
192.168.68.102 srvexporter.local srvexporter
```

### Network and Security

Open the required ports in the firewall:
- **9161:** Exporter metrics endpoint
- **3000:** Grafana (if applicable)
- **9090:** Prometheus (if applicable)

```bash
firewall-cmd --zone=public --add-port=9161/tcp --permanent
firewall-cmd --zone=public --add-port=3000/tcp --permanent
firewall-cmd --zone=public --add-port=9090/tcp --permanent
firewall-cmd --reload
```

Disable SELinux (requires setenforce 0 and editing `/etc/selinux/config` to `SELINUX=disabled`).

## Database Setup

Create a dedicated monitoring user in your Oracle instance or PDB:

```sql
CREATE USER USR_EXPORTER IDENTIFIED BY "YOUR_PASSWORD";
GRANT CREATE SESSION, RESOURCE TO USR_EXPORTER;
GRANT SELECT ANY DICTIONARY TO USR_EXPORTER;
```

## Installation

### 1. Oracle Instant Client

Install the Oracle Instant Client to enable database connectivity:

```bash
dnf install -y oracle-instantclient-release-el8
dnf install -y oracle-instantclient-basic oracle-instantclient-devel oracle-instantclient-sqlplus
```

### 2. Download and Extract the Exporter

Create a working directory and download the latest standalone binary and the default metrics configuration:

```bash
mkdir -p /exporter/
cd /exporter/
touch alert.log

# Replace versions as needed
wget https://github.com/oracle/oracle-db-appdev-monitoring/releases/download/2.2.2/oracledb_exporter-2.2.2.linux-amd64-glibc-2.28.tar.gz
wget https://github.com/oracle/oracle-db-appdev-monitoring/releases/download/2.2.2/default-metrics.toml

tar -zxvf oracledb_exporter-2.2.2.linux-amd64-glibc-2.28.tar.gz
mv default-metrics.toml oracledb_exporter-2.2.2.linux-amd64/
```

## Configuration

Create the `exporter-config.yaml` file inside the exporter directory.

### Example for Single Instance/PDB:

```yaml
databases:
  default:
    username: USR_EXPORTER
    password: YOUR_PASSWORD
    url: 192.168.68.114:1521/PRD1
    queryTimeout: 10
metrics:
  default: default-metrics.toml
log:
  destination: /exporter/alert.log
  interval: 15s
```

### Example for Multitenant (Multiple PDBs):

```yaml
databases:
  db1:
    username: USR_EXPORTER
    password: YOUR_PASSWORD
    url: 192.168.68.114:1521/PRD1
  db2:
    username: USR_EXPORTER
    password: YOUR_PASSWORD
    url: 192.168.68.114:1521/PRD2
metrics:
  default: default-metrics.toml
log:
  destination: /exporter/alert.log
```

## Running the Exporter

Start the binary pointing to your configuration file:

```bash
./oracledb_exporter --config.file=exporter-config.yaml
```

Once running, you can access the metrics at `http://<your-server-ip>:9161/metrics`.

## Integrating with Prometheus

To collect these metrics with Prometheus, add the following target to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: "oracle_exporter"
    static_configs:
      - targets: ["localhost:9161"]
```

## Custom Metrics

The `default-metrics.toml` file includes many standard queries. You can easily extend this by adding your own SQL queries to monitor specific KPIs without requiring additional Oracle licenses like the Tuning Pack.
