"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: scraper_sync_mod.py
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
import requests
from .utils import get_db_path

# Paths
PROMETHEUS_CONFIG_PATH = os.getenv("PROMETHEUS_CONFIG_PATH", "/etc/prometheus/prometheus.yaml")
INFLUX_URL = os.getenv("INFLUX_URL", "http://rockdb_influxdb:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "rockdb_super_secret_token_change_me")
INFLUX_ORG = os.getenv("INFLUX_ORG", "rockdb")

def sync_scrapers():
    """Sync servers with Prometheus and InfluxDB."""
    db_path = get_db_path()
    if not os.path.exists(db_path):
        return

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, ip, exporter_port FROM servers")
        servers = [dict(row) for row in cursor.fetchall()]
        conn.close()

        # 1. Update Prometheus
        update_prometheus(servers)

        # 2. Update InfluxDB (Buckets and Scrapers)
        for server in servers:
            update_influxdb_for_server(server)

    except Exception as e:
        print(f"Scraper Sync Error: {e}")

def update_prometheus(servers):
    if not os.path.exists(PROMETHEUS_CONFIG_PATH):
        print(f"Prometheus config not found at {PROMETHEUS_CONFIG_PATH}")
        return

    try:
        with open(PROMETHEUS_CONFIG_PATH, 'r') as f:
            config = yaml.safe_load(f)

        # Ensure job exists
        job_name = 'node-exporter'
        job = next((j for j in config.get('scrape_configs', []) if j['job_name'] == job_name), None)
        
        if not job:
            job = {
                'job_name': job_name,
                'static_configs': []
            }
            if 'scrape_configs' not in config:
                config['scrape_configs'] = []
            config['scrape_configs'].append(job)

        # Rebuild targets
        targets = [f"{s['ip']}:{s['exporter_port']}" for s in servers]
        job['static_configs'] = [{'targets': targets}]

        with open(PROMETHEUS_CONFIG_PATH, 'w') as f:
            yaml.dump(config, f, default_flow_style=False)
        
        print(f"Prometheus: Updated with {len(targets)} targets.")
    except Exception as e:
        print(f"Error updating Prometheus: {e}")

def update_influxdb_for_server(server):
    """Ensure a bucket and scraper exist in InfluxDB for the server."""
    bucket_name = f"server_{server['id']}"
    headers = {
        "Authorization": f"Token {INFLUX_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        # Get Org ID
        org_res = requests.get(f"{INFLUX_URL}/api/v2/orgs?org={INFLUX_ORG}", headers=headers)
        org_res.raise_for_status()
        org_id = org_res.json()['orgs'][0]['id']

        # 1. Ensure Bucket exists
        buckets_res = requests.get(f"{INFLUX_URL}/api/v2/buckets?name={bucket_name}&orgID={org_id}", headers=headers)
        buckets_res.raise_for_status()
        buckets = buckets_res.json()['buckets']
        
        bucket_id = None
        if not buckets:
            # Create bucket
            create_bucket_payload = {
                "name": bucket_name,
                "orgID": org_id,
                "retentionRules": [{"type": "expire", "everySeconds": 2592000}] # 30 days
            }
            res = requests.post(f"{INFLUX_URL}/api/v2/buckets", headers=headers, json=create_bucket_payload)
            res.raise_for_status()
            bucket_id = res.json()['id']
            print(f"InfluxDB: Created bucket {bucket_name}")
        else:
            bucket_id = buckets[0]['id']

        # 2. Ensure Scraper exists
        # Scrapers API: /api/v2/scrapers
        scrapers_res = requests.get(f"{INFLUX_URL}/api/v2/scrapers?orgID={org_id}", headers=headers)
        scrapers_res.raise_for_status()
        scrapers = scrapers_res.json()['scrapers']
        
        target_url = f"http://{server['ip']}:{server['exporter_port']}/metrics"
        scraper = next((s for s in scrapers if s['url'] == target_url and s['bucketID'] == bucket_id), None)
        
        if not scraper:
            create_scraper_payload = {
                "name": f"scraper_{server['name']}",
                "type": "prometheus",
                "url": target_url,
                "orgID": org_id,
                "bucketID": bucket_id
            }
            res = requests.post(f"{INFLUX_URL}/api/v2/scrapers", headers=headers, json=create_scraper_payload)
            res.raise_for_status()
            print(f"InfluxDB: Created scraper for {server['name']} -> {bucket_name}")
            
    except Exception as e:
        print(f"Error updating InfluxDB for server {server['name']}: {e}")
