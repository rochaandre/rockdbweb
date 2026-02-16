SELECT 
    inst_id,
    sid, 
    serial# as serial, 
    username, 
    status, 
    event,
    sql_id,
    blocking_instance,
    blocking_session
FROM gv$session
WHERE (blocking_session IS NOT NULL)
   OR (sid IN (SELECT blocking_session FROM gv$session WHERE blocking_session IS NOT NULL))
