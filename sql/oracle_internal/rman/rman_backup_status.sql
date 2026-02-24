SELECT
    recid,
    operation,
    status,
    TO_CHAR(start_time, 'YYYY-MM-DD HH24:MI:SS') as start_time,
    TO_CHAR(end_time, 'YYYY-MM-DD HH24:MI:SS') as end_time,
    mbytes_processed 
FROM v$rman_status
WHERE start_time > SYSDATE - :days
ORDER BY start_time DESC ;
