SELECT
    sid                                             sid
  , serial#                                         "SERIAL#"
  , b.opname                                        operation
  , TO_CHAR(b.start_time, 'DD-MON HH24:MI:SS')      start_time
  , b.totalwork                                     totalwork
  , b.sofar                                         sofar
  , ROUND( (b.sofar/DECODE(   b.totalwork
                            , 0
                            , 0.001
                            , b.totalwork)*100),2)  pct_complete
  , b.elapsed_seconds                               elapsed
  , b.time_remaining                                time_remaining
  , DECODE(   b.time_remaining
            , 0
            , TO_CHAR((b.start_time + b.elapsed_seconds/3600/24), 'DD-MON HH24:MI:SS')
            , TO_CHAR((SYSDATE + b.time_remaining/3600/24), 'DD-MON HH24:MI:SS')
    ) est_complete
FROM
       v$session         a
  JOIN v$session_longops b USING (sid,serial#)
WHERE
      a.program LIKE 'rman%'
  AND b.opname LIKE 'RMAN%'
  AND b.opname NOT LIKE '%aggregate%'
  AND b.totalwork > 0
ORDER BY
    b.start_time ;