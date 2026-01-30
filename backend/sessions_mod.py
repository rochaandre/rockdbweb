import oracledb
from .utils import get_oracle_connection

def get_sessions(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        # Rich session query matching the UI needs
        cursor.execute("""
            SELECT 
                s.sid, 
                s.serial# as "serial#", 
                s.username, 
                s.status, 
                s.program, 
                s.machine, 
                s.type,
                s.sql_id, 
                s.prev_sql_id, 
                s.last_call_et, 
                s.event, 
                s.wait_class, 
                s.seconds_in_wait,
                (SELECT ROUND(sum(physical_reads + block_gets + consistent_gets)/1024, 2) FROM v$sess_io WHERE sid = s.sid) as file_io,
                (SELECT value FROM v$sesstat st, v$statname sn WHERE st.sid = s.sid AND st.statistic# = sn.statistic# AND sn.name = 'CPU used by this session') as cpu,
                (SELECT command_name FROM v$sqlcommand WHERE command_type = s.command) as command,
                s.row_wait_obj# as lck_obj,
                (SELECT count(*) FROM v$px_session WHERE qcsid = s.sid) as pqs,
                s.schemaname as owner,
                s.last_call_et as elapsed
            FROM v$session s
            WHERE s.type != 'BACKGROUND'
            ORDER BY s.last_call_et DESC
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def kill_session(conn_info, sid, serial):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"ALTER SYSTEM KILL SESSION '{sid},{serial}' IMMEDIATE")
        return {"success": True, "message": f"Session {sid},{serial} killed"}
    except Exception as e:
        print(f"Error killing session: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_session_sql(conn_info, sql_id):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("SELECT sql_fulltext FROM v$sql WHERE sql_id = :sql_id", [sql_id])
        row = cursor.fetchone()
        if row:
            return {"sql_id": sql_id, "sql_text": str(row[0])}
        return {"sql_id": sql_id, "sql_text": "SQL not found in cursor cache"}
    except Exception as e:
        print(f"Error fetching session SQL: {e}")
        raise e
    finally:
        if connection:
            connection.close()
