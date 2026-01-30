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
