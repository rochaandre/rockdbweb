"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: ansible_sync_mod.py
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
import sqlite3
from .utils import get_db_path

# Path to the shared monitoring directory
# We assume the monitoring dir is at the project root
MONITORING_DIR = os.getenv("MONITORING_DIR", "/app/monitoring")
INVENTORY_PATH = os.path.join(MONITORING_DIR, "ansible", "inventory.ini")

def sync_ansible_inventory():
    """Reads servers from DB and writes an Ansible inventory.ini file."""
    db_path = get_db_path()
    if not os.path.exists(db_path):
        print(f"Ansible Sync: DB not found at {db_path}")
        return

    # Ensure the target directory exists
    dir_name = os.path.dirname(INVENTORY_PATH)
    if not os.path.exists(dir_name):
        try:
            os.makedirs(dir_name, exist_ok=True)
            print(f"Ansible Sync: Created directory {dir_name}")
        except Exception as e:
            print(f"Ansible Sync: Failed to create {dir_name}: {e}")
            return

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT name, ip, type FROM servers")
        servers = [dict(row) for row in cursor.fetchall()]
        conn.close()

        # Groups servers by type (PROD, DEV, etc)
        groups = {}
        for s in servers:
            stype = s.get('type', 'OTHERS') or 'OTHERS'
            if stype not in groups:
                groups[stype] = []
            groups[stype].append(s)

        content = "; Generated automatically by RockDB\n"
        content += "; DO NOT EDIT MANUALLY\n\n"

        for group_name, members in groups.items():
            content += f"[{group_name}]\n"
            for s in members:
                content += f"{s['name']} ansible_host={s['ip']}\n"
            content += "\n"

        with open(INVENTORY_PATH, 'w') as f:
            f.write(content)
        
        print(f"Ansible Sync: Inventory updated at {INVENTORY_PATH} with {len(servers)} servers.")
        
    except Exception as e:
        print(f"Ansible Sync Error: {e}")

if __name__ == "__main__":
    # Test run
    sync_ansible_inventory()
