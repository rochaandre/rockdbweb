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
    sql_address,
    sql_hash_value
FROM gv$session_longops
{where_clause}
ORDER BY start_time DESC
