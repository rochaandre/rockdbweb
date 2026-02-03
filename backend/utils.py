import os
import sqlite3
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import oracledb

load_dotenv()

# Encryption setup
# We use a simple Fernet key for now. In a real app, this should be a persistent environment variable.
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher_suite = Fernet(ENCRYPTION_KEY if isinstance(ENCRYPTION_KEY, bytes) else ENCRYPTION_KEY.encode())

def encrypt_password(password: str) -> str:
    return cipher_suite.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    return cipher_suite.decrypt(encrypted_password.encode()).decode()

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

    # Priority 4: Default behavior (relative to current working dir)
    base_dir = os.getcwd()
    return os.path.join(base_dir, "rockdb.sqlite")

DB_PATH = get_db_path()

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
            inst_name TEXT
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
            link_url TEXT,
            icon_url TEXT,
            codmenutype INTEGER,
            codmenutype_icon_url TEXT,
            codcust INTEGER DEFAULT 1,
            active TEXT DEFAULT 'Y',
            FOREIGN KEY (codmenutype) REFERENCES codmenutype(id)
        )
    """)
    
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
        ("inst_name", "TEXT")
    ]
    
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
        connection = oracledb.connect(
            user=conn_info['username'],
            password=password,
            dsn=f"{conn_info['host']}:{conn_info['port']}/{conn_info['service']}",
            tcp_connect_timeout=5
        )
        return connection
    except Exception as e:
        print(f"Error connecting to Oracle: {e}")
        raise e
