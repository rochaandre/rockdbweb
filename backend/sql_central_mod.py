import os
import sqlite3
from .utils import get_db_connection, get_oracle_connection, SCRIPTS_DIR, safe_value

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
    Resolves the script path based on the Oracle version and organization.
    Hierarchy:
    1. sql/oracle_internal/ (internal/default provided by app)
    2. sql/oracle/ (user-defined or shared)
    """
    if ".." in rel_path or rel_path.startswith("/"):
        raise ValueError("Invalid script path")

    # If the path already has specialized folders, we don't need to resolve it
    special_folders = ["oracle/v11g/", "oracle/v12c/", "oracle/common/", "oracle/rman/", 
                       "oracle_internal/v11g/", "oracle_internal/v12c/", "oracle_internal/common/", "oracle_internal/rman/",
                       "oracle_internal/sqlstatistics/"]
    
    for folder in special_folders:
        if rel_path.startswith(folder):
            return os.path.join(BASE_SQL_DIR, rel_path)

    # Resolve based on version
    version_prefix = "v12c"
    if version:
        try:
            v_num = float('.'.join(version.split('.')[:2]))
            if v_num < 12.1:
                version_prefix = "v11g"
        except:
            pass

    # Search candidates in order of priority
    prefixes = ["oracle_internal", "oracle"]
    
    # rel_path is usually like 'table/sessions.sql' or 'rman/rman_backup_status.sql'
    # We want to check prefixes first
    
    for prefix in prefixes:
        # 1. Try version-specific path
        v_path = f"{prefix}/{version_prefix}/{rel_path}"
        full_v_path = os.path.join(BASE_SQL_DIR, v_path)
        if os.path.exists(full_v_path):
            return full_v_path

        # 2. Try common path
        c_path = f"{prefix}/common/{rel_path}"
        full_c_path = os.path.join(BASE_SQL_DIR, c_path)
        if os.path.exists(full_c_path):
            return full_c_path
            
        # 3. Try specifically for RMAN if it's an rman script
        if "rman" in rel_path:
            r_path = f"{prefix}/rman/{rel_path.split('/')[-1]}"
            full_r_path = os.path.join(BASE_SQL_DIR, r_path)
            if os.path.exists(full_r_path):
                return full_r_path

    # 4. Default/Legacy path
    return os.path.join(BASE_SQL_DIR, rel_path)

def parse_sql_variables(content, variables):
    """
    Substitutes variables in the SQL content.
    variables: dict of {key: value}
    Replaces $key or :key with value (case-insensitive key match).
    """
    if not variables:
        return content
    
    import re
    # Normalize variables to a case-insensitive lookup
    norm_vars = {k.lower(): v for k, v in variables.items()}
    
    def replace_match(match):
        var_name = match.group(2).lower()
        if var_name in norm_vars:
            return str(norm_vars[var_name])
        return match.group(0) # No match, return original text ($VAR or :VAR)

    # Regex: $, : or & followed by word characters (A-Z, 0-9, _)
    # We use a negative lookbehind (?<!\w) to ensure we don't match $ in internal views like gv$sql
    return re.sub(r'(?<!\w)([$:&])(\w+)', replace_match, content)

def get_sql_content(rel_path, version=None, variables=None, is_internal=False):
    # Security check: Prevent SQL Central from reading oracle_internal scripts
    if not is_internal and ("oracle_internal/" in rel_path or "oracle_internal" in rel_path.split(os.sep)):
        raise PermissionError(f"Access denied to internal script: {rel_path}")

    full_path = get_versioned_sql_path(rel_path, version)
    print(f"DEBUG: SQL Central loading script from: {full_path}")
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Script not found: {rel_path}")
    
    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    if variables:
        content = parse_sql_variables(content, variables)
        
    return content

def save_sql_content(rel_path, content, is_internal=False):
    if ".." in rel_path or rel_path.startswith("/"):
        raise ValueError("Invalid script path")
    
    # Security check
    if not is_internal and ("oracle_internal/" in rel_path or "oracle_internal" in rel_path.split(os.sep)):
        raise PermissionError(f"Cannot modify internal script: {rel_path}")

    full_path = os.path.join(BASE_SQL_DIR, rel_path)
    
    # Ensure directory exists (though it should)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

def create_sql_script(folder, name, label, codmenutype, content=None, is_internal=False):
    # Sanitize inputs
    if not name or not folder:
        raise ValueError("Name and folder are required")
    
    # Security check
    if not is_internal and ("oracle_internal" in folder or "oracle_internal" in name):
        raise PermissionError("Cannot create scripts in internal directories")

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
    
    # Create file
    if os.path.exists(full_path):
        raise FileExistsError(f"Script already exists: {rel_path}")
    
    with open(full_path, 'w', encoding='utf-8') as f:
        if content is not None:
            f.write(content)
        else:
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

def delete_sql_script(rel_path, is_internal=False):
    if ".." in rel_path or rel_path.startswith("/"):
        raise ValueError("Invalid script path")
    
    # Security check
    if not is_internal and ("oracle_internal/" in rel_path or "oracle_internal" in rel_path.split(os.sep)):
        raise PermissionError(f"Cannot delete internal script: {rel_path}")

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
        
        # 1. Clean up SQL*Plus artifacts (SET, COL, COLUMN, etc)
        # 2. Support / as terminator alongside ;
        lines = sql_text.splitlines()
        clean_lines = []
        for line in lines:
            trimmed = line.strip()
            # Skip SQL*Plus commands
            if trimmed.upper().startswith(('SET ', 'COL ', 'COLUMN ', 'PROMPT ', 'SHOW ')):
                continue
            if trimmed == '/':
                clean_lines.append(';') # Replace lone / with ; for splitting
            else:
                clean_lines.append(line)
        
        cleaned_sql = "\n".join(clean_lines)
        
        # Split script into separate statements
        statements = [s.strip() for s in cleaned_sql.split(';') if s.strip()]
        
        results = []
        for stmt in statements:
            # Final cleanup: remove trailing / if present within a statement
            if stmt.endswith('/'):
                stmt = stmt[:-1].strip()
            
            try:
                print(f"DEBUG: Executing statement: {stmt}")
                if bind_vars:
                    # Support $VAR string substitution for legacy scripts/compatibility
                    for k, v in bind_vars.items():
                        # Handle cases where value might be string that needs quotes if not already there
                        # but parse_sql_variables usually handles this or the SQL does
                        stmt = stmt.replace(f"${k}", str(v))
                    
                    # Filter bind vars that actually exist in the statement
                    # Oracle oracledb uses :name syntax
                    stmt_binds = {k: v for k, v in bind_vars.items() if f":{k}" in stmt}
                    if stmt_binds:
                        print(f"DEBUG: Using binds: {stmt_binds}")
                        cursor.execute(stmt, stmt_binds)
                    else:
                        cursor.execute(stmt)
                else:
                    cursor.execute(stmt)
                    
                if cursor.description:
                    columns = [col[0].lower() for col in cursor.description]
                    rows = [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
                    print(f"DEBUG: Statement returned {len(rows)} rows.")
                    results.append({"type": "grid", "data": rows, "sql": stmt})
                else:
                    print("DEBUG: Statement executed successfully (no result set).")
                    results.append({"type": "message", "text": "Statement executed successfully", "sql": stmt})
            except Exception as stmt_err:
                print(f"DEBUG: Statement failed: {stmt_err}")
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
    """Scans the sql/ directory and populates cfgmenu with new scripts."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Mapping folder names to codmenutype IDs
        type_mapping = {
            'table': 1,
            'pie': 2,
            'line': 3,
            'gauge': 4,
            'plsql': 5,
            'textplain': 7,
            'tools': 8
        }
        
        print(f"Seeding/Syncing SQL scripts from directory: {BASE_SQL_DIR}", flush=True)
        if not os.path.exists(BASE_SQL_DIR):
            print(f"WARNING: Scripts directory not found: {BASE_SQL_DIR}", flush=True)
            return

        scripts_to_insert = []
        
        for root, dirs, files in os.walk(BASE_SQL_DIR):
            # Skip internal scripts and hidden directories
            if "oracle_internal" in root or "__pycache__" in root:
                continue
            
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
                        'file-text', # codmenutype_icon_url
                        'Y' # active
                    ))
        
        # Cleanup and Sync
        cursor.execute("DELETE FROM cfgmenu WHERE link_url LIKE 'oracle_internal/%'")
        
        if scripts_to_insert:
            print(f"Syncing {len(scripts_to_insert)} scripts to cfgmenu...", flush=True)
            cursor.executemany("""
                INSERT OR IGNORE INTO cfgmenu (name, link_label, link_url, icon_url, codmenutype, codmenutype_icon_url, active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, scripts_to_insert)
        
        # Always ensure example tools are registered (including non-.sql extensions)
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
        if "oracle_internal" in root:
            continue
            
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
