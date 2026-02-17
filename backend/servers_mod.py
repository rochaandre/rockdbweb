"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: servers_mod.py
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
from .utils import get_db_connection

def get_all_servers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, label, host, port, username, key_path, exporter_port, ssh_key, type, created_at FROM servers")
    rows = cursor.fetchall()
    conn.close()
    
    servers = []
    for row in rows:
        d = dict(row)
        # We might want to mask the SSH key in the list view if it's sensitive
        if d['ssh_key']:
            d['ssh_key'] = '••••••••'
        servers.append(d)
    return servers

def save_server(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = """INSERT INTO servers (label, host, port, username, password, key_path, exporter_port, ssh_key, type) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"""
    params = (data['label'], data['host'], data.get('port', 22), 
              data.get('username'), data.get('password'), data.get('key_path'),
              data.get('exporter_port', 9100), data.get('ssh_key'), data.get('type', 'LINUX'))
    
    cursor.execute(sql, params)
    last_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Trigger sync
    try:
        from .scraper_sync_mod import sync_scrapers
        sync_scrapers()
    except ImportError:
        pass
    
    try:
        from .ansible_sync_mod import sync_ansible_inventory
        sync_ansible_inventory()
    except ImportError:
        pass
        
    return last_id

def update_server(server_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    fields = ["label", "host", "port", "username", "key_path", "exporter_port", "type"]
    params = [data.get(f) for f in fields]
    
    sql = "UPDATE servers SET " + ", ".join([f"{f}=?" for f in fields])
    
    if 'password' in data and data['password'] and data['password'] != '••••••••':
        sql += ", password=?"
        params.append(data['password'])
        
    if 'ssh_key' in data and data['ssh_key'] != '••••••••' and data['ssh_key'] is not None:
        sql += ", ssh_key=?"
        params.append(data['ssh_key'])
        
    sql += " WHERE id=?"
    params.append(server_id)
    
    cursor.execute(sql, params)
    conn.commit()
    conn.close()
    
    # Trigger sync
    try:
        from .scraper_sync_mod import sync_scrapers
        sync_scrapers()
    except ImportError:
        pass

    try:
        from .ansible_sync_mod import sync_ansible_inventory
        sync_ansible_inventory()
    except ImportError:
        pass

def delete_server(server_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM servers WHERE id = ?", (server_id,))
    conn.commit()
    conn.close()
    
    # Trigger sync
    try:
        from .scraper_sync_mod import sync_scrapers
        sync_scrapers()
    except ImportError:
        pass

    try:
        from .ansible_sync_mod import sync_ansible_inventory
        sync_ansible_inventory()
    except ImportError:
        pass
