SELECT 
    qcsid, 
    sid, 
    sql_hash_value as hash_value, 
    message, 
    TO_CHAR(start_time,'DD/MM/YYYY HH24:MI:SS') as inicio,
    ELAPSED_SECONDS as elapsed, 
    TIME_REMAINING as remaining, 
    TO_CHAR(sysdate + (TIME_REMAINING/3600/24),'DD/MM/YYYY HH24:MI:SS') as previsao,
    CASE WHEN totalwork > 0 THEN ROUND(sofar/totalwork*100,2) ELSE 0 END as done_pct
FROM v$session_longops l
WHERE (sid LIKE :sid OR qcsid LIKE :sid)
  AND LAST_UPDATE_TIME >= sysdate - 1
  AND sql_hash_value IN (SELECT hash_value FROM v$open_cursor WHERE sid LIKE :sid)
ORDER BY start_time
