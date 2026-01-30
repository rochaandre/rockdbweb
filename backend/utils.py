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
DB_PATH = os.path.join(os.path.dirname(__file__), "../rockdb.sqlite")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
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
