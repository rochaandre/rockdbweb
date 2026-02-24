SELECT 
    inst_id,
    qcsid, 
    sid, 
    sql_id,
    sql_hash_value as hash_value, 
    message, 
    TO_CHAR(start_time,'DD/MM/YYYY HH24:MI:SS') as inicio,
    TO_CHAR(start_time,'DD/MM/YYYY HH24:MI:SS') as start_tim,
    ELAPSED_SECONDS as elapsed, 
    ELAPSED_SECONDS as elapsed_seconds, 
    TIME_REMAINING as remaining, 
    TIME_REMAINING as time_remaining, 
    TO_CHAR(sysdate + (NVL(TIME_REMAINING,0)/86400),'DD/MM/YYYY HH24:MI:SS') as previsao,
    TO_CHAR(sysdate + (NVL(TIME_REMAINING,0)/86400),'DD/MM/YYYY HH24:MI:SS') as tim,
    sofar,
    totalwork,
    units,
    CASE WHEN totalwork > 0 THEN ROUND(sofar/totalwork*100,2) ELSE 0 END as done_pct,
    CASE WHEN totalwork > 0 THEN ROUND(sofar/totalwork*100,2) ELSE 0 END as pct
FROM gv$session_longops l
WHERE (TO_CHAR(sid) LIKE :sid OR TO_CHAR(qcsid) LIKE :sid)
  AND (inst_id = :inst_id OR :inst_id = 0)
  AND (sofar < totalwork OR last_update_time > sysdate - (5/1440)) -- Active OR updated in last 5 min
ORDER BY last_update_time DESC
