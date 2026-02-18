import os
import sqlite3
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import oracledb
import traceback
import sys

load_dotenv()

# Encryption setup
# We use a simple Fernet key for now. In a real app, this should be a persistent environment variable.
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher_suite = Fernet(ENCRYPTION_KEY if isinstance(ENCRYPTION_KEY, bytes) else ENCRYPTION_KEY.encode())

def encrypt_password(password: str) -> str:
    return cipher_suite.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    try:
        return cipher_suite.decrypt(encrypted_password.encode()).decode()
    except Exception:
        # Fallback for plain text, already decrypted, or masked passwords
        return encrypted_password

# SQLite Database setup
# SQLite Database setup
def get_db_path():
    # Priority 1: Explicit database file path
    env_path = os.getenv("ROCKDB_DATABASE_PATH")
    if env_path:
        return env_path
    
    # Priority 2: Data directory environment variable
    data_dir = os.getenv("ROCKDB_DATA_DIR")
    if data_dir:
        return os.path.join(data_dir, "rockdb.sqlite")
    
    # Priority 3: Standard container path
    container_path = "/opt/rockdbweb/rockdb.sqlite"
    if os.path.exists("/opt/rockdbweb"):
        return container_path

    # Priority 4: Look for rockdb.sqlite in the project root (where main.py's parent is)
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    root_db = os.path.join(root_dir, "rockdb.sqlite")
    if os.path.exists(root_db):
        return root_db

    # Priority 5: Default behavior (relative to current working dir)
    base_dir = os.getcwd()
    return os.path.join(base_dir, "rockdb.sqlite")

def get_scripts_dir():
    # Priority 1: Environment variable
    env_path = os.getenv("ROCKDB_SCRIPTS_DIR")
    if env_path:
        abs_path = os.path.abspath(env_path)
        print(f"Using ROCKDB_SCRIPTS_DIR from env: {abs_path}", flush=True)
        return abs_path
    
    # Priority 2: Standard project path
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sql"))
    return abs_path

DB_PATH = get_db_path()
SCRIPTS_DIR = get_scripts_dir()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    abs_path = os.path.abspath(DB_PATH)
    exists = os.path.exists(abs_path)
    print(f"Initializing database at: {abs_path} (exists: {exists})", flush=True)
    conn = get_db_connection()
    cursor = conn.cursor()
    # Ensure all columns exist (Migration handling)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            host TEXT NOT NULL,
            port TEXT NOT NULL,
            service TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            type TEXT CHECK(type IN ('PROD', 'DEV', 'TEST')),
            is_active BOOLEAN DEFAULT 0,
            last_connected DATETIME,
            version TEXT,
            patch TEXT,
            os TEXT,
            db_type TEXT,
            role TEXT,
            apply_status TEXT,
            patch_info TEXT,
            log_mode TEXT,
            is_rac BOOLEAN,
            inst_name TEXT,
            connection_mode TEXT DEFAULT 'BASIC',
            connection_role TEXT DEFAULT 'NORMAL',
            connect_string TEXT,
            wallet_path TEXT,
            tns_admin TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_preferences (
            connection_id INTEGER NOT NULL,
            screen_id TEXT NOT NULL,
            data TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (connection_id, screen_id),
            FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS servers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            label TEXT,
            ip TEXT,
            host TEXT,
            port INTEGER DEFAULT 22,
            username TEXT,
            password TEXT,
            ssh_key TEXT,
            key_path TEXT,
            exporter_port INTEGER NOT NULL DEFAULT 9100,
            type TEXT CHECK(type IN ('PROD', 'DEV', 'TEST', 'LINUX', 'UNIX')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS codmenutype (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            icon_url TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cfgmenu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            link_label TEXT,
            link_url TEXT UNIQUE,
            icon_url TEXT,
            codmenutype INTEGER,
            codmenutype_icon_url TEXT,
            codcust INTEGER DEFAULT 1,
            active TEXT DEFAULT 'Y',
            FOREIGN KEY (codmenutype) REFERENCES codmenutype(id)
        )
    """)
    
    # Migration: Ensure link_url is unique for existing databases
    try:
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_cfgmenu_link_url ON cfgmenu(link_url)")
    except Exception as e:
        print(f"Migration Notice: Could not create unique index on link_url (likely duplicates exist): {e}")
        # If it fails due to duplicates, we'll let seed_sql_scripts handle or clean it manually
    
    # Seed codmenutype
    menu_types = [
        (1, 'Table', 'table'),
        (2, 'Pie', 'pie-chart'),
        (3, 'Bar', 'bar-chart-2'),
        (4, 'Gauge', 'gauge'),
        (5, 'PLSQL Output', 'file-text'),
        (7, 'Text', 'file'),
        (8, 'External Tool', 'monitor')
    ]
    cursor.executemany("INSERT OR IGNORE INTO codmenutype (id, name, icon_url) VALUES (?, ?, ?)", menu_types)
    
    # Check for missing columns and add them if necessary
    columns_to_add = [
        ("db_type", "TEXT"),
        ("role", "TEXT"),
        ("apply_status", "TEXT"),
        ("patch_info", "TEXT"),
        ("log_mode", "TEXT"),
        ("is_rac", "BOOLEAN"),
        ("inst_name", "TEXT"),
        ("connection_mode", "TEXT"),
        ("connection_role", "TEXT"),
        ("connect_string", "TEXT"),
        ("wallet_path", "TEXT"),
        ("tns_admin", "TEXT")
    ]
    
    server_columns_to_add = [
        ("label", "TEXT"),
        ("host", "TEXT"),
        ("port", "INTEGER DEFAULT 22"),
        ("username", "TEXT"),
        ("password", "TEXT"),
        ("key_path", "TEXT")
    ]
    
    cursor.execute("PRAGMA table_info(servers)")
    existing_server_columns = [col[1] for col in cursor.fetchall()]
    
    for col_name, col_type in server_columns_to_add:
        if col_name not in existing_server_columns:
            print(f"Adding column {col_name} to servers table...")
            cursor.execute(f"ALTER TABLE servers ADD COLUMN {col_name} {col_type}")

    cursor.execute("PRAGMA table_info(connections)")
    existing_columns = [col[1] for col in cursor.fetchall()]
    
    for col_name, col_type in columns_to_add:
        if col_name not in existing_columns:
            print(f"Adding column {col_name} to connections table...")
            cursor.execute(f"ALTER TABLE connections ADD COLUMN {col_name} {col_type}")
            
    conn.commit()
    conn.close()

# Oracle connectivity helper
def get_oracle_connection(conn_info):
    try:
        password = decrypt_password(conn_info['password'])
        
        # Set TNS_ADMIN if provided (directory containing tnsnames.ora, sqlnet.ora)
        tns_admin = conn_info.get('tns_admin')
        if tns_admin and os.path.exists(tns_admin):
            os.environ['TNS_ADMIN'] = tns_admin

        # Determine DSN - Connection String is the primary source
        if conn_info.get('connect_string'):
            dsn = conn_info['connect_string'].strip()
            # If the string starts with "ALIAS = (DESCRIPTION...", strip the leading "ALIAS =" part
            if '=' in dsn and dsn.upper().startswith(tuple(c for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_")):
                parts = dsn.split('=', 1)
                if len(parts) > 1 and '(DESCRIPTION' in parts[1].upper():
                    dsn = parts[1].strip()
        else:
            # Fallback to Basic Attributes
            dsn = f"{conn_info['host']}:{conn_info['port']}/{conn_info['service']}"
        
        # Determine Role / Internal Logon
        role = (conn_info.get('connection_role') or 'NORMAL').upper()
        
        # LOGGING FOR DEBUGGING
        print("--- Oracle Connection Environment ---", flush=True)
        print(f"Connection Name : {conn_info.get('name')}", flush=True)
        print(f"DSN / String    : {dsn}", flush=True)
        print(f"Current User    : {conn_info['username']}", flush=True)
        print(f"Requested Role  : {role}", flush=True)
        
        # TNS_ADMIN Details
        env_tns_admin = os.environ.get('TNS_ADMIN', 'NOT SET')
        tns_admin_field = conn_info.get('tns_admin')
        print(f"ENV TNS_ADMIN   : {env_tns_admin}", flush=True)
        if tns_admin_field:
             exists = os.path.exists(tns_admin_field)
             print(f"Field TNS_ADMIN : {tns_admin_field} (Exists: {exists})", flush=True)
        
        # Wallet Details
        wallet_path = conn_info.get('wallet_path', 'NOT SET')
        print(f"Wallet Path     : {wallet_path}", flush=True)
        if conn_info.get('wallet_path'):
             exists = os.path.exists(conn_info['wallet_path'])
             print(f"Wallet Valid    : {exists}", flush=True)
             if exists:
                  print(f"Wallet Files    : {os.listdir(conn_info['wallet_path'])}", flush=True)
             else:
                  print("Tip: Suggested persistent wallet folder is /opt/rockdbweb/wallets (shared with host)", flush=True)
        print("-------------------------------------", flush=True)

        internal_logon = None
        if role != 'NORMAL':
            # Map roles to oracledb constants safely using getattr
            role_map = {
                'SYSDBA': getattr(oracledb, 'AUTH_MODE_SYSDBA', None),
                'SYSOPER': getattr(oracledb, 'AUTH_MODE_SYSOPER', None),
                'SYSBACKUP': getattr(oracledb, 'AUTH_MODE_SYSBACKUP', None),
                'SYSDG': getattr(oracledb, 'AUTH_MODE_SYSDG', None),
                'SYSKM': getattr(oracledb, 'AUTH_MODE_SYSKM', None)
            }
            internal_logon = role_map.get(role)
            if internal_logon is None:
                print(f"Warning: Constant for role {role} not found in this version of oracledb. Connection might fail if privs required.", flush=True)

        # Prepare connection parameters
        connect_params = {
            "user": conn_info['username'],
            "password": password,
            "dsn": dsn,
            "tcp_connect_timeout": 5,
            "config_dir": conn_info.get('wallet_path') if conn_info.get('wallet_path') else None,
            "wallet_location": conn_info.get('wallet_path') if conn_info.get('wallet_path') else None,
            "wallet_password": password if conn_info.get('wallet_path') else None
        }
        
        # Add mode only if connecting as a special role (SYSDBA, etc)
        if internal_logon:
            connect_params["mode"] = internal_logon

        connection = oracledb.connect(**connect_params)
        return connection
    except Exception as e:
        print(f"!!! Error connecting to Oracle: {str(e)}", flush=True)
        print("Full Traceback:", flush=True)
        traceback.print_exc(file=sys.stdout)
        raise e

def safe_value(v):
    """
    Safely converts Oracle-specific data types (LOBs, RAWs/bytes) 
    to JSON-serializable formats for FastAPI.
    """
    if v is None:
        return v
    # Handle Oracle LOB objects (CLOB/BLOB)
    if hasattr(v, 'read'):
        try:
            return v.read()
        except Exception as e:
            return f"-- Error reading LOB: {str(e)} --"
    # Handle RAW/Bytes - FastAPI jsonable_encoder fails on non-UTF8 bytes
    if isinstance(v, bytes):
        try:
            return v.decode('utf-8')
        except UnicodeDecodeError:
            # For memory addresses and other binary data, use Hex
            return v.hex().upper()
    return v
