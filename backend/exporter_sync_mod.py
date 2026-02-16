"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: exporter_sync_mod.py
# Author: Andre Rocha (TechMax Consultoria)
# 
# LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
#
# TERMS:
# 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
# 2. YOU MAY NOT MODIFY, transform, or build upon this code.
# 3. You must maintain this header and original naming/ownership information.
#
# This software is provided "AS IS", without warranty of any kind.
# Copyright (c) 2026 Andre Rocha. All rights reserved.
# ==============================================================================
"""
import os
import yaml
import sqlite3
from .utils import get_db_path, decrypt_password

# Path inside the container for the exporter config
CONFIG_PATH = os.getenv("EXPORTER_CONFIG_PATH", "/exporter/config.yaml")

def sync_exporter_config():
    """Reads all connections from SQLite and updates the exporter's config.yaml."""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        print(f"Sync Exporter: Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Robust column detection
        cursor.execute("PRAGMA table_info(connections)")
        existing_cols = [col[1] for col in cursor.fetchall()]
        
        target_cols = ['name', 'host', 'port', 'service', 'username', 'password']
        optional_cols = ['connection_mode', 'connection_role', 'connect_string']
        
        for col in optional_cols:
            if col in existing_cols:
                target_cols.append(col)
        
        query = f"SELECT {', '.join(target_cols)} FROM connections"
        cursor.execute(query)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()

        databases = {}
        for row in rows:
            # Map localhost for container use
            target_host = row['host']
            if target_host in ["localhost", "127.0.0.1"]:
                target_host = "host.docker.internal"
            
            # Determine URL/DSN
            # Prefix with db_ to ensure valid YAML key (must start with letter)
            if row.get('connection_mode') == 'STRING' and row.get('connect_string'):
                url = row['connect_string']
                # Replace localhost in full connection string if needed
                url = url.replace('localhost', 'host.docker.internal').replace('127.0.0.1', 'host.docker.internal')
                # Use name as entry key, ensure it starts with db_
                entry_key = f"db_{row['name'].replace(' ', '_').replace('.', '_')}"
            else:
                service = row['service']
                port = row['port']
                url = f"{target_host}:{port}/{service}"
                entry_key = f"db_{target_host.replace('.', '_')}_{service}"
            
            # Ensure URL has the oracle:// prefix
            if not url.startswith("oracle://"):
                url = f"oracle://{url}"
            
            # Decrypt the password
            try:
                raw_password = decrypt_password(row['password'])
            except Exception as e:
                print(f"Sync Exporter: Error decrypting password for {row['name']}: {e}")
                continue

            # Handle Identity/Role (e.g. sys as sysdba)
            username = row['username']
            role = (row.get('connection_role') or 'NORMAL').upper()
            if role != 'NORMAL':
                username = f"{username} as {role}"

            databases[entry_key] = {
                "username": username,
                "password": raw_password,
                "url": url,
                "queryTimeout": 5,
                "maxOpenConns": 10,
                "maxIdleConns": 10
            }

        config = {
            "databases": databases,
            "metrics": {
                "default": "/exporter/default-metrics.toml",
                "custom": [
                    "/exporter/txeventq-metrics.toml",
                    "/exporter/more-txeventq-metrics.toml"
                ]
            },
            "log": {
                "destination": "stdout"
            }
        }

        # Ensure the directory exists
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)

        with open(CONFIG_PATH, 'w') as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=False)
        
        print(f"Sync Exporter: Successfully updated {CONFIG_PATH} with {len(databases)} connections.")

    except Exception as e:
        print(f"Sync Exporter Error: {e}")

if __name__ == "__main__":
    # Allow running as a script for initial sync during container startup
    sync_exporter_config()
