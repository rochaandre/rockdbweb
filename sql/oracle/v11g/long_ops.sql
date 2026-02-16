SELECT 
    inst_id,
    sid, 
    serial# as serial, 
    username, 
    opname, 
    target, 
    sofar, 
    totalwork, 
    time_remaining, 
    message,
    sql_id,
    NULL as con_id -- Normalization
FROM gv$session_longops
{where_clause}
ORDER BY start_time DESC
