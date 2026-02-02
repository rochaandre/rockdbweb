import os
import sqlite3
from .utils import get_db_connection, get_oracle_connection

BASE_SQL_DIR = os.path.join(os.path.dirname(__file__), "../sql")

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

def get_sql_content(rel_path):
    if ".." in rel_path or rel_path.startswith("/"):
        raise ValueError("Invalid script path")
    
    full_path = os.path.join(BASE_SQL_DIR, rel_path)
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
    
    full_path = os.path.join(BASE_SQL_DIR, rel_path)
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Script not found: {rel_path}")

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

def execute_generic_sql(conn_info, sql_text, auto_commit=False):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Split script if multiple statements (simple split by semicolon)
        # Note: This is naive, but works for many scripts. 
        # A more robust regex might be needed for PL/SQL blocks.
        statements = [s.strip() for s in sql_text.split(';') if s.strip()]
        
        results = []
        for stmt in statements:
            try:
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
        
        # Check if already seeded (simple check)
        cursor.execute("SELECT COUNT(*) FROM cfgmenu")
        if cursor.fetchone()[0] > 0:
            return
        
        print("Seeding SQL scripts from disk...")
        scripts_to_insert = []
        
        for root, dirs, files in os.walk(BASE_SQL_DIR):
            for file in files:
                if file.endswith('.sql'):
                    rel_path = os.path.relpath(os.path.join(root, file), BASE_SQL_DIR)
                    
                    # Determine type from path
                    parts = rel_path.split(os.sep)
                    # Expected: oracle/<type>/... or <type>/...
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
        
        cursor.executemany("""
            INSERT INTO cfgmenu (name, link_label, link_url, icon_url, codmenutype, codmenutype_icon_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, scripts_to_insert)
        
        # Add example tools
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
