SELECT 
    inst_id,
    sid, 
    serial# as serial, 
    username, 
    status, 
    event,
    sql_id,
    sql_address,
    sql_hash_value,
    blocking_instance,
    blocking_session,
    NULL as con_id -- Normalization
FROM gv$session
WHERE (blocking_session IS NOT NULL)
   OR (sid IN (SELECT blocking_session FROM gv$session WHERE blocking_session IS NOT NULL))
