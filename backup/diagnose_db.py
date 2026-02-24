import oracledb
import os
import sys

# Add parent dir to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.utils import get_oracle_connection
from backend.db_connections import get_active_connection

def diagnose():
    active = get_active_connection()
    if not active:
        print("No active connection found.")
        return
    
    conn = None
    try:
        conn = get_oracle_connection(active)
        print(f"Connected to: {active['name']}")
        print(f"Oracle Version: {conn.version}")
        
        cursor = conn.cursor()
        
        print("\n--- Columns in DBA_TAB_MODIFICATIONS ---")
        cursor.execute("SELECT column_name FROM dba_tab_columns WHERE table_name = 'DBA_TAB_MODIFICATIONS' ORDER BY column_id")
        cols = [row[0] for row in cursor.fetchall()]
        for c in cols:
            print(f"- {c}")
            
        print("\n--- Columns in DBA_TAB_STATISTICS ---")
        cursor.execute("SELECT column_name FROM dba_tab_columns WHERE table_name = 'DBA_TAB_STATISTICS' ORDER BY column_id")
        cols = [row[0] for row in cursor.fetchall()]
        for c in cols:
            print(f"- {c}")
            
    except Exception as e:
        print(f"Error during diagnosis: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    diagnose()
