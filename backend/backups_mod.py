"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: backups_mod.py
# Author: Andre Rocha (TechMax Consultoria)
# 
# LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
#
# TERMS:
# 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
# 2. YOU MAY NOT MODIFY, transform, or build upon this code.
# 3. You must maintain this header and original naming/ownership information.
#
# This software is provided "AS IS", without warranty of any kind.
# Copyright (c) 2026 Andre Rocha. All rights reserved.
# ==============================================================================
"""
import oracledb
from .utils import get_oracle_connection

def get_backup_jobs(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
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
                time_taken_display
            FROM v$rman_backup_job_details
            ORDER BY start_time DESC
            FETCH FIRST 50 ROWS ONLY
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching backup jobs: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_backup_summary(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                input_type,
                count(*) as total_backups,
                status,
                round(sum(output_bytes)/1024/1024/1024, 2) as size_gb
            FROM v$rman_backup_job_details
            WHERE start_time > sysdate - 30
            GROUP BY input_type, status
            ORDER BY input_type
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching backup summary: {e}")
        raise e
    finally:
        if connection:
            connection.close()

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
        """, sk=session_key)
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
        """, bk=bs_key)
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
