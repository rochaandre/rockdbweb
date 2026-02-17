import oracledb
from .utils import get_oracle_connection, safe_value

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
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
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
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
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
        # Load version-aware SQL
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/segments.sql", version)
        
        cursor.execute(sql_text, ts=tablespace_name)
        columns = [col[0].lower() for col in cursor.description]
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
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
        
        # 1. Main Occupants
        cursor.execute("""
            SELECT occupant_name as name, schema_name as schema, 
                   round(space_usage_kbytes/1024, 2) as space_mb,
                   round(space_usage_kbytes/1024/1024, 2) as space_gb,
                   move_procedure
            FROM v$sysaux_occupants
            WHERE space_usage_kbytes > 0
            ORDER BY space_usage_kbytes DESC
        """)
        cols_occ = [col[0].lower() for col in cursor.description]
        occupants = [{k: safe_value(v) for k, v in zip(cols_occ, row)} for row in cursor.fetchall()]

        # 2. Stats History Availability
        cursor.execute("SELECT dbms_stats.get_stats_history_availability FROM dual")
        avail = safe_value(cursor.fetchone()[0])
        
        # 3. Top WRI$_OPTSTAT Objects (Space Hogs)
        cursor.execute("""
            SELECT * FROM (
                SELECT segment_name, segment_type, round(bytes/1024/1024, 2) as mb
                FROM dba_segments
                WHERE tablespace_name = 'SYSAUX'
                  AND segment_name LIKE 'WRI$_OPTSTAT%'
                ORDER BY bytes DESC
            ) WHERE rownum <= 10
        """)
        cols_obj = [col[0].lower() for col in cursor.description]
        top_objects = [{k: safe_value(v) for k, v in zip(cols_obj, row)} for row in cursor.fetchall()]
        
        return {
            "occupants": occupants,
            "availability": str(avail) if avail else "N/A",
            "top_objects": top_objects
        }
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
        
        # 1. Recent Stats
        # Load version-aware SQL
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/undo_stats.sql", version)
        
        cursor.execute(sql_text)
        columns = [col[0].lower() for col in cursor.description]
        stats_rows = cursor.fetchall()
        stats = [{k: safe_value(v) for k, v in zip(columns, row)} for row in stats_rows]

        # 2. Retention Parameters
        cursor.execute("SELECT value FROM v$parameter WHERE name = 'undo_retention'")
        row_ret = cursor.fetchone()
        retention = int(row_ret[0]) if row_ret else 900
        
        # 3. Max Query Length
        max_q = max([s.get('maxquerylen', 0) for s in stats]) if stats else 0

        return {
            "stats": stats,
            "retention": retention,
            "max_query_len": safe_value(max_q)
        }
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
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
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
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
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
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
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

def get_stats_history_retention(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # 1. DBMS_STATS retention
        cursor.execute("SELECT dbms_stats.get_stats_history_retention FROM dual")
        row = cursor.fetchone()
        stats_ret = row[0] if row else 0
        
        # 2. Advisor Task retention (what the user sets via DBMS_SQLTUNE)
        advisor_ret = 0
        try:
            cursor.execute("""
                SELECT value 
                FROM dba_advisor_parameters 
                WHERE task_name = 'AUTO_STATS_ADVISOR_TASK' 
                  AND parameter_name = 'EXECUTION_DAYS_TO_EXPIRE'
            """)
            row_adv = cursor.fetchone()
            if row_adv:
                advisor_ret = int(row_adv[0])
        except:
            # Fallback to a broader search or ignore if no privileges
            pass
            
        return {
            "retention": stats_ret, 
            "advisor_retention": advisor_ret
        }
    except Exception as e:
        print(f"Error getting stats retention: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def set_stats_history_retention(conn_info, days):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # 1. Update Advisor Task Parameter (DBMS_SQLTUNE)
        # The procedure expects a VARCHAR2 for the value.
        try:
            cursor.execute("""
                BEGIN
                    DBMS_SQLTUNE.SET_TUNING_TASK_PARAMETER(
                        task_name => 'AUTO_STATS_ADVISOR_TASK', 
                        parameter => 'EXECUTION_DAYS_TO_EXPIRE', 
                        value => :days
                    );
                END;
            """, days=str(days))
        except Exception as e:
            print(f"Warning: could not set advisor task parameter: {e}")
            
        # 1.1 Delete expired advisor tasks (USER REQUESTED)
        try:
            cursor.execute("BEGIN PRVT_ADVISOR.delete_expired_tasks; END;")
        except Exception as e:
            print(f"Warning: could not call PRVT_ADVISOR.delete_expired_tasks: {e}")
            
        # 2. Update Stats History Retention (DBMS_STATS) - requires DBA/SYS
        try:
            cursor.execute("BEGIN DBMS_STATS.ALTER_STATS_HISTORY_RETENTION(:days); END;", days=days)
        except Exception as e:
            print(f"Warning: could not alter stats history retention: {e}")
            
        # 2.1 Purge old stats (Sync with retention)
        try:
            cursor.execute("BEGIN DBMS_STATS.PURGE_STATS(DBMS_STATS.PURGE_ALL); END;")
        except Exception as e:
            print(f"Warning: could not purge old stats: {e}")
            
        connection.commit()
        
        # Return the resulting new state
        return get_stats_history_retention(conn_info)
    except Exception as e:
        print(f"Error setting stats retention: {e}")
        raise e
    finally:
        if connection:
            connection.close()
