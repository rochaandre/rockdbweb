SELECT to_char(begin_time, 'HH24:MI') as begin_time,
       to_char(end_time, 'HH24:MI') as end_time,
       undoblks, txncount, maxquerylen, maxconcurrency, inst_id
FROM gv$undostat
ORDER BY begin_time DESC
FETCH FIRST 30 ROWS ONLY
