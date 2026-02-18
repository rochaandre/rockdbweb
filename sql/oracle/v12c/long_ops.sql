SELECT 
    inst_id,
    sid, 
    serial# as serial, 
    username, 
    opname, 
    target, 
    sofar, 
    totalwork, 
    elapsed_seconds,
    time_remaining, 
    round((sofar / nvl(nullif(totalwork, 0), 1)) * 100, 2) as pct,
    to_char(start_time, 'DD-MON-YY HH24:MI') as start_tim,
    to_char(sql_exec_start, 'DD-MON-YY HH24:MI') as exec_tim,
    to_char(sysdate + (time_remaining / (24 * 60 * 60)), 'HH24:MI') as tim,
    to_char(sysdate, 'HH24:MI') as sysdt,
    message,
    sql_id,
    sql_address,
    sql_hash_value
FROM gv$session_longops
{where_clause}
ORDER BY elapsed_seconds DESC
