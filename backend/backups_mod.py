import oracledb
from .utils import get_oracle_connection

def get_backup_jobs(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Check if time_taken_display exists, if not calculate it
        cursor.execute("""
            SELECT count(*) 
            FROM all_tab_columns 
            WHERE table_name = 'V$RMAN_BACKUP_JOB_DETAILS' 
              AND column_name = 'TIME_TAKEN_DISPLAY'
        """)
        has_time_display = cursor.fetchone()[0] > 0
        
        time_col = "time_taken_display" if has_time_display else "to_char(floor(elapsed_seconds/3600), 'fm9900') || ':' || to_char(floor(mod(elapsed_seconds, 3600)/60), 'fm00') || ':' || to_char(mod(elapsed_seconds, 60), 'fm00') as time_taken_display"

        cursor.execute(f"""
            SELECT * FROM (
                SELECT 
                    session_key,
                    command_id,
                    status,
                    to_char(start_time, 'DD-MON HH24:MI') as start_time,
                    to_char(end_time, 'DD-MON HH24:MI') as end_time,
                    input_type,
                    output_device_type,
                    input_bytes_display,
                    output_bytes_display,
                    {time_col}
                FROM v$rman_backup_job_details
                WHERE start_time > sysdate - 14
                ORDER BY start_time DESC
            ) WHERE rownum <= 50
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching backup jobs: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_backup_summary(conn_info, days=30):
    try:
        return execute_rman_sql_report(
            conn_info, 
            'rman_backup_summary.sql', 
            variables={"days": int(days)}
        )
    except Exception as e:
        print(f"Error fetching backup summary from script: {e}")
        raise e
def get_backup_info(conn_info, days=30):
    try:
        return execute_rman_sql_report(
            conn_info, 
            'rman_backup_info.sql', 
            variables={"days": int(days)}
        )
    except Exception as e:
        print(f"Error fetching backup info from script: {e}")
        raise e

def get_backup_sets(conn_info, session_key):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                bs_key,
                backup_type as type,
                tag,
                device_type,
                pieces,
                round(bytes/1024/1024, 2) as size_mb
            FROM v$backup_set
            WHERE session_key = :sk
            ORDER BY bs_key
        """, {"sk": session_key})
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching backup sets: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_backup_datafiles(conn_info, bs_key):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                file#,
                tablespace_name as tablespace,
                to_char(checkpoint_change#) as checkpoint_scn,
                round(bytes/1024/1024, 2) as size_mb
            FROM v$backup_datafile
            WHERE bs_key = :bk
            ORDER BY file#
        """, {"bk": bs_key})
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching backup datafiles: {e}")
        raise e
    finally:
        if connection:
            connection.close()
def get_nls_parameters(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Query 1: Session NLS parameters
        cursor.execute("""
            SELECT DECODE(parameter, 'NLS_CHARACTERSET', 'char_set',
                          'NLS_LANGUAGE', 'language',
                          'NLS_TERRITORY', 'territory') as name,
                   value
            FROM v$nls_parameters
            WHERE parameter IN ('NLS_CHARACTERSET', 'NLS_LANGUAGE', 'NLS_TERRITORY')
        """)
        session_params = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Query 2: Database NLS parameters
        cursor.execute("SELECT value FROM NLS_DATABASE_PARAMETERS WHERE parameter='NLS_CHARACTERSET'")
        db_char_set = cursor.fetchone()
        
        return {
            "language": session_params.get('language', 'N/A'),
            "territory": session_params.get('territory', 'N/A'),
            "db_charset": db_char_set[0] if db_char_set else 'N/A'
        }
    except Exception as e:
        print(f"Error fetching NLS parameters: {e}")
        raise e
    finally:
        if connection:
            connection.close()
def get_backup_images(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT * FROM (
                SELECT 
                    file#,
                    name,
                    tag,
                    status,
                    to_char(checkpoint_change#) as checkpoint_scn,
                    round((blocks * block_size)/1024/1024, 2) as size_mb,
                    to_char(creation_time, 'DD-MON HH24:MI') as creation_time
                FROM v$datafile_copy
                ORDER BY creation_time DESC
            ) WHERE rownum <= 50
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching backup images: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_recovery_summary(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS') as current_time,
                to_char(created, 'YYYY-MM-DD HH24:MI:SS') as created,
                dbid,
                current_scn,
                name,
                log_mode, open_mode,
                controlfile_type
            FROM v$database
        """)
        columns = [col[0].lower() for col in cursor.description]
        row = cursor.fetchone()
        return dict(zip(columns, row)) if row else {}
    except Exception as e:
        print(f"Error fetching recovery summary: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_incarnations(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                incarnation#,
                resetlogs_change#,
                to_char(resetlogs_time, 'YYYY-MM-DD HH24:MI:SS') as resetlogs_time,
                prior_resetlogs_change#,
                status,
                resetlogs_id
            FROM v$database_incarnation
            ORDER BY incarnation# DESC
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching incarnations: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_datafiles_detailed(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                file#,
                name,
                status,
                enabled,
                checkpoint_change#,
                to_char(checkpoint_time, 'YYYY-MM-DD HH24:MI:SS') as checkpoint_time,
                last_change#
            FROM v$datafile
            ORDER BY file#
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching detailed datafiles: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def execute_rman_sql_report(conn_info, rel_path, variables=None):
    from .sql_central_mod import get_sql_content, execute_generic_sql
    try:
        # 1. Get and parse the SQL
        print(f"Xxxxxx DEBUG: Executing RMAN report {rel_path} with vars: {variables}")
        sql_text = get_sql_content(rel_path, version=conn_info.get('version'), variables=variables, is_internal=True)
        print(f"DEBUG: Processed SQL:\n{sql_text}")
        
        # 2. Execute via generic executor
        results = execute_generic_sql(conn_info, sql_text, auto_commit=False, bind_vars=variables)
        
        # 3. Process results: look for grids or errors
        for res in results:
            if res['type'] == 'error':
                raise Exception(res['message'])
            if res['type'] == 'grid':
                return res['data']
        return []
    except Exception as e:
        print(f"Error executing RMAN report {rel_path}: {e}")
        raise e

def get_rman_progress(conn_info):
    """Specific function for RMAN progress in long ops."""
    return execute_rman_sql_report(conn_info, 'oracle_internal/rman/rman_backup_progress.sql')
