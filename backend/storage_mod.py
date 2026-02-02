import oracledb
from .utils import get_oracle_connection

def get_tablespaces_detailed(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                t.tablespace_name,
                t.block_size,
                t.initial_extent,
                t.next_extent,
                t.min_extents,
                t.max_extents,
                t.pct_increase,
                t.status,
                t.contents,
                t.logging,
                t.allocation_type,
                t.segment_space_management,
                df.total_bytes / 1024 / 1024 as total_mb,
                (df.total_bytes - nvl(fs.free_bytes, 0)) / 1024 / 1024 as used_mb,
                nvl(fs.free_bytes, 0) / 1024 / 1024 as free_mb,
                ROUND((df.total_bytes - nvl(fs.free_bytes, 0)) / df.total_bytes * 100, 2) as used_pct
            FROM 
                dba_tablespaces t
                JOIN (SELECT tablespace_name, SUM(bytes) total_bytes FROM dba_data_files GROUP BY tablespace_name) df
                  ON t.tablespace_name = df.tablespace_name
                LEFT JOIN (SELECT tablespace_name, SUM(bytes) free_bytes FROM dba_free_space GROUP BY tablespace_name) fs
                  ON t.tablespace_name = fs.tablespace_name
            ORDER BY t.tablespace_name
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching detailed tablespaces: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_data_files(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                file_name,
                file_id,
                tablespace_name,
                bytes / 1024 / 1024 as size_mb,
                status,
                autoextensible,
                maxbytes / 1024 / 1024 as max_mb,
                increment_by * (SELECT value FROM v$parameter WHERE name = 'db_block_size') / 1024 / 1024 as next_mb
            FROM dba_data_files
            ORDER BY tablespace_name, file_name
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching data files: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_segments(conn_info, tablespace_name):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                owner || '.' || segment_name as name,
                round(bytes / 1024 / 1024, 2) as value
            FROM dba_segments
            WHERE tablespace_name = :ts
            ORDER BY bytes DESC
            FETCH FIRST 10 ROWS ONLY
        """, ts=tablespace_name)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching segments: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_sysaux_occupants(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT occupant_name as name, schema_name as schema, 
                   round(space_usage_kbytes/1024, 2) as space_mb,
                   space_usage_kbytes/1024 || ' MB' as space_usage
            FROM v$sysaux_occupants
            WHERE space_usage_kbytes > 0
            ORDER BY space_usage_kbytes DESC
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching sysaux occupants: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_undo_stats(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT to_char(begin_time, 'HH24:MI') as begin_time,
                   to_char(end_time, 'HH24:MI') as end_time,
                   undoblks, txncount, maxquerylen, maxconcurrency, inst_id
            FROM gv$undostat
            ORDER BY begin_time DESC
            FETCH FIRST 30 ROWS ONLY
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching undo stats: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_temp_usage(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT s.sid || ',' || s.serial# as sid_serial, s.username, s.program, s.sql_id, 
                   t.tablespace, round(t.blocks * (SELECT value FROM v$parameter WHERE name = 'db_block_size') / 1024 / 1024, 2) as mb_used,
                   s.inst_id
            FROM gv$tempseg_usage t
            JOIN gv$session s ON t.session_addr = s.saddr AND t.inst_id = s.inst_id
            ORDER BY t.blocks DESC
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching temp usage: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_control_files(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("SELECT inst_id, name, status, block_size, file_size_blks FROM gv$controlfile")
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching control files: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_checkpoint_progress(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        # Recovery metrics for chart
        cursor.execute("""
            SELECT recovery_estimated_ios as est_ios, 
                   actual_redo_blks as actual_blks, 
                   target_redo_blks as target_blks,
                   estimated_mttr
            FROM v$inst_recovery
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching checkpoint progress: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def force_checkpoint(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("ALTER SYSTEM CHECKPOINT")
    except Exception as e:
        print(f"Error forcing checkpoint: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def resize_datafile(conn_info, file_id, new_size_mb):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"ALTER DATABASE DATAFILE {file_id} RESIZE {new_size_mb}M")
        # No need to commit DDL but good practice to show intent
    except Exception as e:
        print(f"Error resizing datafile: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def add_datafile(conn_info, tablespace_name, file_name, size_mb):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        # Clean file_name for safety (basic)
        cursor.execute(f"ALTER TABLESPACE {tablespace_name} ADD DATAFILE '{file_name}' SIZE {size_mb}M")
    except Exception as e:
        print(f"Error adding datafile: {e}")
        raise e
    finally:
        if connection:
            connection.close()
