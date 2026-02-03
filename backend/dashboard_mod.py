import oracledb
from .utils import get_oracle_connection

def get_dashboard_metrics(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()

        # 1. Summary Metrics
        cursor.execute("SELECT count(*) FROM v$session")
        total_sessions = cursor.fetchone()[0]

        cursor.execute("SELECT count(*) FROM v$session WHERE status = 'ACTIVE' AND type != 'BACKGROUND'")
        active_sessions = cursor.fetchone()[0]

        # 2. SGA Info
        cursor.execute("SELECT name, bytes FROM v$sgainfo")
        sga_info = {row[0]: row[1] for row in cursor.fetchall()}

        # 3. Object Status
        cursor.execute("""
            SELECT status, count(*) 
            FROM dba_objects 
            WHERE owner NOT IN ('SYS', 'SYSTEM') 
            GROUP BY status
        """)
        objects = {row[0]: row[1] for row in cursor.fetchall()}

        # 4. Open Cursors
        cursor.execute("SELECT sum(a.value), b.name FROM v$sesstat a, v$statname b WHERE a.statistic# = b.statistic# AND b.name = 'opened cursors current' GROUP BY b.name")
        open_cursors = cursor.fetchone()
        open_cursors_val = open_cursors[0] if open_cursors else 0

        # 5. Triggers
        cursor.execute("SELECT status, count(*) FROM dba_triggers GROUP BY status")
        triggers = {row[0]: row[1] for row in cursor.fetchall()}

        return {
            "sessions": {
                "total": total_sessions,
                "active": active_sessions
            },
            "sga": sga_info,
            "health": {
                "objects": objects,
                "cursors": open_cursors_val,
                "triggers": triggers
            }
        }
    except Exception as e:
        print(f"Error fetching dashboard metrics: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_tablespace_summary(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                df.tablespace_name,
                ROUND(df.bytes / 1024 / 1024, 2) as total_mb,
                ROUND((df.bytes - nvl(fs.bytes, 0)) / 1024 / 1024, 2) as used_mb,
                ROUND(nvl(fs.bytes, 0) / 1024 / 1024, 2) as free_mb,
                ROUND((df.bytes - nvl(fs.bytes, 0)) / df.bytes * 100, 2) as used_pct
            FROM 
                (SELECT tablespace_name, SUM(bytes) bytes FROM dba_data_files GROUP BY tablespace_name) df
                LEFT JOIN (SELECT tablespace_name, SUM(bytes) bytes FROM dba_free_space GROUP BY tablespace_name) fs
                ON df.tablespace_name = fs.tablespace_name
            ORDER BY used_pct DESC
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching tablespace summary: {e}")
        raise e
    finally:
        if connection:
            connection.close()
