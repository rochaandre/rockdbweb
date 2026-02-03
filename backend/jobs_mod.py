import oracledb
from .utils import get_oracle_connection

def get_legacy_jobs(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Extended query for dba_jobs
        sql = """
            SELECT 
                job,
                log_user as schema_name,
                TO_CHAR(last_date, 'YYYY-MM-DD HH24:MI:SS') as last_run,
                TO_CHAR(next_date, 'YYYY-MM-DD HH24:MI:SS') as next_run,
                failures,
                broken,
                interval as frequency,
                what as details
            FROM dba_jobs
            ORDER BY job
        """
        cursor.execute(sql)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    finally:
        if connection:
            connection.close()

def get_running_jobs(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Joined query for running jobs with session info
        sql = """
            SELECT 
                r.sid,
                s.serial#,
                r.job,
                TO_CHAR(r.this_date, 'YYYY-MM-DD HH24:MI:SS') as start_time,
                s.event,
                s.seconds_in_wait,
                s.state,
                j.what as details
            FROM dba_jobs_running r
            JOIN dba_jobs j ON r.job = j.job
            JOIN v$session s ON r.sid = s.sid
            ORDER BY r.this_date ASC
        """
        cursor.execute(sql)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    finally:
        if connection:
            connection.close()

def run_legacy_job(conn_info, job_id):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"BEGIN dbms_job.run({job_id}); COMMIT; END;")
        return True
    finally:
        if connection:
            connection.close()

def set_legacy_job_broken(conn_info, job_id, broken):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        broken_val = 'TRUE' if broken else 'FALSE'
        cursor.execute(f"BEGIN dbms_job.broken({job_id}, {broken_val}); COMMIT; END;")
        return True
    finally:
        if connection:
            connection.close()

def remove_legacy_job(conn_info, job_id):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute(f"BEGIN dbms_job.remove({job_id}); COMMIT; END;")
        return True
    finally:
        if connection:
            connection.close()

def submit_legacy_job(conn_info, what, next_date=None, interval=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Prepare parameters
        next_date_val = f"TO_DATE('{next_date}', 'YYYY-MM-DD HH24:MI:SS')" if next_date else "SYSDATE"
        interval_val = f"'{interval}'" if interval else "NULL"
        
        # We need a variable to hold the returned job number
        plsql = f"""
            DECLARE
                job_no BINARY_INTEGER;
            BEGIN
                dbms_job.submit(job_no, :what, {next_date_val}, {interval_val});
                COMMIT;
            END;
        """
        cursor.execute(plsql, {"what": what})
        return True
    finally:
        if connection:
            connection.close()
