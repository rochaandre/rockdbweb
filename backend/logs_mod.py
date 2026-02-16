"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: logs_mod.py
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

def get_alert_logs(conn_info, limit=100):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"""
            SELECT 
                to_char(originating_timestamp, 'DD-MON-YYYY HH24:MI:SS') as timestamp,
                message_text,
                message_level,
                component_id
            FROM v$diag_alert_ext
            ORDER BY originating_timestamp DESC
            FETCH FIRST {limit} ROWS ONLY
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        try:
            cursor = connection.cursor()
            cursor.execute(f"""
                SELECT 
                    to_char(timestamp, 'DD-MON-YYYY HH24:MI:SS') as timestamp,
                    message_text,
                    NULL as message_level,
                    NULL as component_id
                FROM v$alert_log
                ORDER BY timestamp DESC
                FETCH FIRST {limit} ROWS ONLY
            """)
            columns = [col[0].lower() for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
        except:
            print(f"Error fetching alert logs: {e}")
            return [{"timestamp": "N/A", "message_text": f"Error accessing alert log views: {str(e)}"}]
    finally:
        if connection:
            connection.close()

def get_db_parameters(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                num, name, value, display_value, 
                isdefault, issys_modifiable, ismodified, 
                description
            FROM v$parameter 
            ORDER BY name
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching parameters: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_outstanding_alerts(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                reason_id as id,
                to_char(time_suggested, 'DD-MON HH24:MI') as creation_time,
                object_type as type,
                message_level as level,
                reason as message,
                suggested_action
            FROM dba_outstanding_alerts
            ORDER BY time_suggested DESC
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching outstanding alerts: {e}")
        return []
    finally:
        if connection:
            connection.close()
