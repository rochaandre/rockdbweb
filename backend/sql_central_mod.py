"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: sql_central_mod.py
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
from .utils import get_db_connection, get_oracle_connection, SCRIPTS_DIR

BASE_SQL_DIR = SCRIPTS_DIR

def get_sql_registry():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT m.*, t.name as type_name, t.icon_url as type_icon
            FROM cfgmenu m
            LEFT JOIN codmenutype t ON m.codmenutype = t.id
            WHERE m.active = 'Y'
        """)
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_versioned_sql_path(rel_path, version=None):
    """
    Resolves the script path based on the Oracle version.
    Hierarchy:
    1. sql/oracle/v11g/ or sql/oracle/v12c/ (based on version)
    2. sql/oracle/common/
    3. sql/oracle/ (legacy/default)
    """
    if ".." in rel_path or rel_path.startswith("/"):
        raise ValueError("Invalid script path")

    # If the path already has v11g/ or v12c/ or common/, we don't need to resolve it
    if rel_path.startswith("oracle/v11g/") or rel_path.startswith("oracle/v12c/") or rel_path.startswith("oracle/common/"):
        return os.path.join(BASE_SQL_DIR, rel_path)

    # Resolve based on version
    version_prefix = "v11g"
    if version:
        try:
            # Check if version is >= 12.1
            v_num = float('.'.join(version.split('.')[:2]))
            if v_num >= 12.1:
                version_prefix = "v12c"
        except:
            pass

    # 1. Try version-specific path
    # rel_path is usually like 'oracle/table/sessions.sql'
    # We want 'oracle/v11g/table/sessions.sql'
    if rel_path.startswith("oracle/"):
        v_path = rel_path.replace("oracle/", f"oracle/{version_prefix}/", 1)
        full_v_path = os.path.join(BASE_SQL_DIR, v_path)
        if os.path.exists(full_v_path):
            return full_v_path

        # 2. Try common path
        c_path = rel_path.replace("oracle/", "oracle/common/", 1)
        full_c_path = os.path.join(BASE_SQL_DIR, c_path)
        if os.path.exists(full_c_path):
            return full_c_path

    # 3. Default/Legacy path
    return os.path.join(BASE_SQL_DIR, rel_path)

def get_sql_content(rel_path, version=None):
    full_path = get_versioned_sql_path(rel_path, version)
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Script not found: {rel_path}")
    
    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def save_sql_content(rel_path, content):
    if ".." in rel_path or rel_path.startswith("/"):
        raise ValueError("Invalid script path")
    
    full_path = os.path.join(BASE_SQL_DIR, rel_path)
    
    # Ensure directory exists (though it should)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

def create_sql_script(folder, name, label, codmenutype):
    # Sanitize inputs
    if not name or not folder:
        raise ValueError("Name and folder are required")
    
    # Ensure filename ends with .sql
    if not name.endswith('.sql'):
        filename = f"{name}.sql"
    else:
        filename = name
        name = name.replace('.sql', '')

    # Path within sql/
    # If folder is 'root', we save in BASE_SQL_DIR, but usually it's oracle/pie etc.
    if folder == 'root':
        rel_path = filename
    else:
        rel_path = os.path.join(folder, filename)

    if ".." in rel_path or rel_path.startswith("/"):
        raise ValueError("Invalid script path")

    full_path = os.path.join(BASE_SQL_DIR, rel_path)
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    # Create empty file
    if os.path.exists(full_path):
        raise FileExistsError(f"Script already exists: {rel_path}")
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write("-- New Script\nSELECT 'Hello' FROM dual;")

    # Register in SQLite
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cfgmenu (name, link_label, link_url, icon_url, codmenutype, codmenutype_icon_url, active)
            VALUES (?, ?, ?, 'file', ?, 'file-text', 'Y')
        """, (name, label, rel_path, codmenutype))
        conn.commit()
    finally:
        conn.close()
    
    return rel_path

def delete_sql_script(rel_path):
    if ".." in rel_path or rel_path.startswith("/"):
        raise ValueError("Invalid script path")
    
    full_path = os.path.join(BASE_SQL_DIR, rel_path)
    
    # 1. Remove from Disk
    if os.path.exists(full_path):
        os.remove(full_path)
    
    # 2. Remove from SQLite
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cfgmenu WHERE link_url = ?", (rel_path,))
        conn.commit()
    finally:
        conn.close()
    return True

def execute_external_tool(conn_info, tool_name, rel_path):
    """Executes an external tool (sqlcl, rman) and returns the output."""
    import subprocess
    
    version = conn_info.get('version')
    full_path = get_versioned_sql_path(rel_path, version)
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Script not found: {rel_path} (Resolved: {full_path})")

    # Build connection string for the tool
    # Example: sql -s username/password@host:port/service
    # Example: rman target username/password@host:port/service
    conn_str = f"{conn_info['username']}/{conn_info['password']}@//{conn_info['host']}:{conn_info['port']}/{conn_info['service']}"
    
    cmd = []
    if tool_name.lower() in ['sqlcl', 'sql']:
        cmd = ['sql', '-s', conn_str, f'@{full_path}']
    elif tool_name.lower() == 'rman':
        cmd = ['rman', 'target', conn_str, f'@{full_path}']
    elif tool_name.lower() == 'dgmgrl':
        cmd = ['dgmgrl', conn_str, f'@{full_path}']
    elif tool_name.lower() == 'sqlldr':
        cmd = ['sqlldr', conn_str, f'control={full_path}']
    else:
        raise ValueError(f"Unsupported tool: {tool_name}")

    try:
        process = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60 # 1 minute timeout
        )
        return {
            "stdout": process.stdout,
            "stderr": process.stderr,
            "returncode": process.returncode
        }
    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out (60s)"}
    except Exception as e:
        return {"error": str(e)}

def execute_generic_sql(conn_info, sql_text, auto_commit=False, bind_vars=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # 1. Perform $VARIABLE replacement (for scripts that use this legacy syntax)
        if bind_vars:
            import re
            for k, v in bind_vars.items():
                # Case-insensitive replacement of $KEY or $key with the value
                # We use a negative lookahead to ensure we don't match partial variable names (e.g. $SID vs $SID_EXTRA)
                pattern = re.compile(re.escape(f"${k}") + r"(?![a-zA-Z0-9_])", re.IGNORECASE)
                sql_text = pattern.sub(str(v), sql_text)

        # Split script if multiple statements (simple split by semicolon)
        statements = [s.strip() for s in sql_text.split(';') if s.strip()]
        
        results = []
        for stmt in statements:
            try:
                if bind_vars:
                    # Filter bind vars that actually exist in the statement
                    # Oracle oracledb uses :name syntax
                    stmt_binds = {k: v for k, v in bind_vars.items() if f":{k}" in stmt}
                    if stmt_binds:
                        cursor.execute(stmt, stmt_binds)
                    else:
                        cursor.execute(stmt)
                else:
                    cursor.execute(stmt)
                if cursor.description:
                    columns = [col[0].lower() for col in cursor.description]
                    rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
                    results.append({"type": "grid", "data": rows, "sql": stmt})
                else:
                    results.append({"type": "message", "text": "Statement executed successfully", "sql": stmt})
            except Exception as stmt_err:
                results.append({"type": "error", "message": str(stmt_err), "sql": stmt})
        
        if auto_commit:
            connection.commit()
            
        return results
    except Exception as e:
        print(f"SQL Execution Error: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def seed_sql_scripts():
    """Scans the sql/ directory and populates cfgmenu if empty."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Mapping folder names to codmenutype IDs
        type_mapping = {
            'table': 1,
            'pie': 2,
            'line': 3, # Reusing Bar icon or adding Line
            'gauge': 4,
            'plsql': 5,
            'textplain': 7,
            'tools': 8
        }
        
        # Scanning SQL scripts from directory
        print(f"Scanning SQL scripts from directory: {BASE_SQL_DIR}", flush=True)
        if not os.path.exists(BASE_SQL_DIR):
            print(f"WARNING: Scripts directory not found: {BASE_SQL_DIR}", flush=True)
            return

        # Get existing link_urls to avoid duplicates
        cursor.execute("SELECT link_url FROM cfgmenu")
        existing_urls = {row[0] for row in cursor.fetchall()}

        scripts_to_insert = []
        for root, dirs, files in os.walk(BASE_SQL_DIR):
            for file in files:
                if file.endswith('.sql'):
                    rel_path = os.path.relpath(os.path.join(root, file), BASE_SQL_DIR)
                    
                    if rel_path in existing_urls:
                        continue

                    # Determine type from path
                    parts = rel_path.split(os.sep)
                    ctype = 1 # Default to Table
                    for part in parts:
                        if part in type_mapping:
                            ctype = type_mapping[part]
                            break
                    
                    name = file.replace('.sql', '')
                    label = name.replace('_', ' ').title()
                    
                    scripts_to_insert.append((
                        name,
                        label,
                        rel_path,
                        'file', # Generic icon
                        ctype,
                        'file-text' # codmenutype_icon_url
                    ))
        
        if scripts_to_insert:
            print(f"Found {len(scripts_to_insert)} new scripts to register", flush=True)
            cursor.executemany("""
                INSERT OR IGNORE INTO cfgmenu (name, link_label, link_url, icon_url, codmenutype, codmenutype_icon_url)
                VALUES (?, ?, ?, ?, ?, ?)
            """, scripts_to_insert)
        
        # Always ensure example tools are registered
        tool_scripts = [
            ('SQLcl Example', 'oracle/tools/sqlcl_example.sql', 8),
            ('RMAN Example', 'oracle/tools/rman_example.rcv', 8),
            ('DGMGRL Example', 'oracle/tools/dgmgrl_example.txt', 8),
            ('SQLLDR Example', 'oracle/tools/sqlldr_example.ctl', 8),
        ]
        
        for label, rel_path, ctype in tool_scripts:
            name = os.path.basename(rel_path)
            cursor.execute("SELECT id FROM cfgmenu WHERE link_url = ?", (rel_path,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO cfgmenu (name, link_label, link_url, icon_url, codmenutype, codmenutype_icon_url, active)
                    VALUES (?, ?, ?, 'file', ?, 'monitor', 'Y')
                """, (name, label, rel_path, ctype))
        
        conn.commit()
    finally:
        conn.close()

def search_sql_content(query):
    """Scans all .sql files in BASE_SQL_DIR for the given query string."""
    matches = []
    if not query:
        return matches
        
    query_lower = query.lower()
    
    for root, dirs, files in os.walk(BASE_SQL_DIR):
        for file in files:
            if file.endswith('.sql'):
                rel_path = os.path.relpath(os.path.join(root, file), BASE_SQL_DIR)
                try:
                    full_path = os.path.join(BASE_SQL_DIR, rel_path)
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        if query_lower in content.lower():
                            matches.append(rel_path)
                except Exception as e:
                    print(f"Error searching in {rel_path}: {e}")
                    
    return matches
