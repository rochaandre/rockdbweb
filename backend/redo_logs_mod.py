from .utils import get_oracle_connection

def get_redo_groups(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT group#, thread#, sequence#, 
                   round(bytes / 1024 / 1024, 2) as size_mb,
                   status, archived, inst_id
            FROM gv$log
            ORDER BY thread#, group#
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching redo groups: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_redo_switch_history(conn_info, days=7, inst_id=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        where_clause = f"WHERE FIRST_TIME > sysdate - {days}"
        if inst_id is not None:
            where_clause += f" AND thread# = {inst_id}"
        
        sql = f"""
            SELECT TO_CHAR(TRUNC(FIRST_TIME),'Mon DD') as dg_date,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'00',1,0)),'9999') as h00,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'01',1,0)),'9999') as h01,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'02',1,0)),'9999') as h02,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'03',1,0)),'9999') as h03,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'04',1,0)),'9999') as h04,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'05',1,0)),'9999') as h05,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'06',1,0)),'9999') as h06,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'07',1,0)),'9999') as h07,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'08',1,0)),'9999') as h08,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'09',1,0)),'9999') as h09,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'10',1,0)),'9999') as h10,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'11',1,0)),'9999') as h11,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'12',1,0)),'9999') as h12,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'13',1,0)),'9999') as h13,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'14',1,0)),'9999') as h14,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'15',1,0)),'9999') as h15,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'16',1,0)),'9999') as h16,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'17',1,0)),'9999') as h17,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'18',1,0)),'9999') as h18,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'19',1,0)),'9999') as h19,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'20',1,0)),'9999') as h20,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'21',1,0)),'9999') as h21,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'22',1,0)),'9999') as h22,
            TO_CHAR(SUM(DECODE(TO_CHAR(FIRST_TIME,'HH24'),'23',1,0)),'9999') as h23
            FROM V$LOG_HISTORY
            {where_clause}
            GROUP BY TRUNC(FIRST_TIME)
            ORDER BY TRUNC(FIRST_TIME) DESC
        """
        cursor.execute(sql)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching redo switch history: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_redo_threads(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        # Fetch unique threads that have history in the last 30 days
        cursor.execute("SELECT DISTINCT thread# FROM v$log_history WHERE first_time > sysdate - 30 ORDER BY thread#")
        return [row[0] for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching redo threads: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def add_redo_group(conn_info, thread, size_mb, member_path=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        if member_path:
            cursor.execute(f"ALTER DATABASE ADD LOGFILE THREAD {thread} '{member_path}' SIZE {size_mb}M")
        else:
            cursor.execute(f"ALTER DATABASE ADD LOGFILE THREAD {thread} SIZE {size_mb}M")
    except Exception as e:
        print(f"Error adding redo group: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def drop_redo_group(conn_info, group_id):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"ALTER DATABASE DROP LOGFILE GROUP {group_id}")
    except Exception as e:
        print(f"Error dropping redo group: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def add_redo_member(conn_info, group_id, member_path):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"ALTER DATABASE ADD LOGFILE MEMBER '{member_path}' TO GROUP {group_id}")
    except Exception as e:
        print(f"Error adding redo member: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def drop_redo_member(conn_info, member_path):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"ALTER DATABASE DROP LOGFILE MEMBER '{member_path}'")
    except Exception as e:
        print(f"Error dropping redo member: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def switch_logfile(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        # Archive log current is more robust as it ensures archiving
        try:
            cursor.execute("ALTER SYSTEM ARCHIVE LOG CURRENT")
        except:
            # Fallback to switch logfile if archive log current is not allowed (e.g. noarchivelog)
            cursor.execute("ALTER SYSTEM SWITCH LOGFILE")
    except Exception as e:
        print(f"Error switching logfile: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_standby_redo_groups(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT group#, thread#, sequence#, 
                   round(bytes / 1024 / 1024, 2) as size_mb,
                   status
            FROM v$standby_log
            ORDER BY thread#, group#
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching standby redo groups: {e}")
        return []
    finally:
        if connection:
            connection.close()

def get_archived_logs(conn_info, limit=50):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"""
            SELECT name, thread#, sequence#, 
                   round(blocks * block_size / 1024 / 1024, 2) as size_mb,
                   to_char(first_time, 'YYYY-MM-DD HH24:MI:SS') as time
            FROM v$archived_log
            WHERE name IS NOT NULL
              AND first_time > sysdate - 1
            ORDER BY first_time DESC
        """)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchmany(limit)]
    except Exception as e:
        print(f"Error fetching archived logs: {e}")
        return []
    finally:
        if connection:
            connection.close()

def get_log_buffer_stats(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Get general stats
        cursor.execute("""
            SELECT name, value 
            FROM v$sysstat 
            WHERE name IN ('redo entries', 'redo groups yields', 'redo buffer allocation retries', 'redo log space requests')
        """)
        stats = {row[0].lower(): row[1] for row in cursor.fetchall()}
        
        # Get log buffer size
        cursor.execute("SELECT value FROM v$parameter WHERE name = 'log_buffer'")
        row = cursor.fetchone()
        if row:
            stats['log_buffer_size'] = round(int(row[0]) / 1024 / 1024, 2)
            
        return stats
    except Exception as e:
        print(f"Error fetching log buffer stats: {e}")
        return {}
    finally:
        if connection:
            connection.close()

def get_redo_management_info(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # 1. Fetch parameters
        cursor.execute("SELECT name, value FROM v$parameter WHERE name IN ('log_archive_dest_1', 'log_archive_format')")
        params = {row[0].lower(): row[1] for row in cursor.fetchall()}
        
        # 2. Fetch specific query results
        cursor.execute("""
            SELECT 
                (SELECT log_mode FROM v$database) AS db_log_mode,
                (SELECT value FROM v$parameter WHERE name = 'log_archive_dest_state_1') AS auto_archival,
                (SELECT destination FROM v$archive_dest WHERE dest_id = 1) AS archive_dest,
                (SELECT max(sequence#) FROM v$log) AS oldest_online_seq,
                (SELECT max(sequence#) FROM v$archived_log) AS next_archive_seq,
                (SELECT sequence# FROM v$log WHERE status = 'CURRENT') AS current_seq
            FROM dual
        """)
        row = cursor.fetchone()
        columns = [col[0].lower() for col in cursor.description]
        status_info = dict(zip(columns, row)) if row else {}
        
        return {**params, **status_info}
    except Exception as e:
        print(f"Error fetching redo management info: {e}")
        raise e
    finally:
        if connection:
            connection.close()
def get_redo_members(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("SELECT group#, member, type, is_recovery_dest_file FROM v$logfile ORDER BY group#")
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching redo members: {e}")
        return []
    finally:
        if connection:
            connection.close()
