import oracledb
from .utils import get_oracle_connection

def get_duplicate_source_info(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()

        # 1. Basic Database Context
        cursor.execute("SELECT name, db_unique_name, open_mode, log_mode, database_role, platform_name FROM v$database")
        db_info_row = cursor.fetchone()
        db_info = {
            "name": db_info_row[0] if db_info_row else "UNKNOWN",
            "db_unique_name": db_info_row[1] if db_info_row else "UNKNOWN",
            "open_mode": db_info_row[2] if db_info_row else "UNKNOWN",
            "log_mode": db_info_row[3] if db_info_row else "UNKNOWN",
            "database_role": db_info_row[4] if db_info_row else "UNKNOWN",
            "platform_name": db_info_row[5] if db_info_row else "UNKNOWN"
        }

        # 2. Database Size and Files
        cursor.execute("SELECT count(*) as df_count, sum(bytes)/1024/1024/1024 as size_gb FROM v$datafile")
        df_row = cursor.fetchone()
        db_size = {
            "datafile_count": df_row[0] if df_row else 0,
            "total_size_gb": round(df_row[1], 2) if df_row and df_row[1] else 0
        }

        # 3. Temporary Tablespaces Information
        cursor.execute(
            """
            SELECT tablespace_name, 
                   round(sum(bytes)/1024/1024, 2) as size_mb, 
                   count(*) as file_count
            FROM dba_temp_files 
            GROUP BY tablespace_name
            """
        )
        temp_tbs = [{"tablespace": row[0], "size_mb": row[1], "file_count": row[2]} for row in cursor.fetchall()]

        # 4. SGA and PGA Configuration
        cursor.execute("SELECT name, value, display_value FROM v$parameter WHERE name IN ('sga_target', 'pga_aggregate_target', 'sga_max_size', 'memory_target')")
        mem_params = [{"name": row[0], "value": row[1], "display": row[2]} for row in cursor.fetchall()]

        # 5. Sessions and Open Cursors
        cursor.execute("SELECT count(*) FROM v$session")
        session_count = cursor.fetchone()[0]

        cursor.execute("SELECT sum(value) FROM v$sysstat WHERE name = 'opened cursors current'")
        cursors_count = cursor.fetchone()[0]

        return {
            "database": db_info,
            "size": db_size,
            "temp_tablespaces": temp_tbs,
            "memory_parameters": mem_params,
            "activity": {
                "sessions": session_count,
                "open_cursors": cursors_count
            },
            "connection_string": f"{conn_info.get('host')}:{conn_info.get('port')}/{conn_info.get('service')}"
        }

    except Exception as e:
        print(f"Error fetching duplicate source info: {e}")
        raise e
    finally:
        if connection:
            connection.close()
