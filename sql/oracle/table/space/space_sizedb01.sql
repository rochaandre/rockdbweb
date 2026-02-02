WITH vdados
AS (
SELECT
(select min(creation_time) from v$datafile) created  ,
(select name from v$database) "Database Name",
ROUND((SUM(USED.BYTES) / 1024 / 1024/ 1024 ),2) || ' GB' dbsizemv,
ROUND((SUM(USED.BYTES) / 1024 / 1024/ 1024 ) - ROUND(FREE.P / 1024 / 1024/ 1024 ),2) || ' GB'  UsedSpace ,
ROUND(((SUM(USED.BYTES) / 1024 / 1024 ) - (FREE.P / 1024 / 1024 )) / ROUND(SUM(USED.BYTES) / 1024 / 1024 ,2)*100,2) || '% GB' usedinperc,
ROUND((FREE.P / 1024 / 1024 / 1024),2) || ' GB' Free_Space,
ROUND(((SUM(USED.BYTES) / 1024 / 1024 ) - ((SUM(USED.BYTES) / 1024 / 1024 ) -
ROUND(FREE.P / 1024 / 1024 )))/ROUND(SUM(USED.BYTES) / 1024 / 1024,2 )*100,2) || '% GB' Freeinperc,
ROUND(((SUM(USED.BYTES) / 1024 / 1024 ) - (FREE.P / 1024 / 1024 ))/(select sysdate-min(creation_time) from v$datafile),2) || ' MB' Growth_DAY,
ROUND(((SUM(USED.BYTES) / 1024 / 1024 ) - (FREE.P / 1024 / 1024 ))/(select sysdate-min(creation_time) from v$datafile)/ROUND((SUM(USED.BYTES) / 1024 / 1024 ),2)*100,3) || '% MB' Growth_DAY_in_perc,
ROUND(((SUM(USED.BYTES) / 1024 / 1024 ) - (FREE.P / 1024 / 1024 ))/(select sysdate-min(creation_time) from v$datafile)*7,2) || ' MB' Growth_WEEK,
ROUND((((SUM(USED.BYTES) / 1024 / 1024 ) - (FREE.P / 1024 / 1024 ))/(select sysdate-min(creation_time) from v$datafile)/ROUND((SUM(USED.BYTES) / 1024 / 1024 ),2)*100)*7,3) || '% MB' Growth_WEEK_in_perc
FROM    (SELECT BYTES FROM V$DATAFILE
UNION ALL
SELECT BYTES FROM V$TEMPFILE
UNION ALL
SELECT BYTES FROM V$LOG) USED,
(SELECT SUM(BYTES) AS P FROM DBA_FREE_SPACE) FREE
GROUP BY FREE.P)
SELECT   'Create Time' lbl, to_char(created,'DD/MM/YYYY HH24:MI') value FROM vdados
UNION ALL
SELECT   'Database Size' lbl, dbsizemv value FROM vdados
UNION ALL
SELECT   'Used in %' lbl, Usedinperc value FROM vdados
UNION ALL
SELECT   'Free Space' lbl, Free_Space value FROM vdados
UNION ALL
SELECT   'Free in %' lbl, freeinperc value FROM vdados
UNION ALL
SELECT   'Growth DAY' lbl, Growth_DAY value FROM vdados
UNION ALL
SELECT   'Free in %' lbl, freeinperc value FROM vdados
UNION ALL
SELECT   'Growth DAY in %' lbl, Growth_DAY_in_perc value FROM vdados
UNION ALL
SELECT   'Growth WEEK' lbl, Growth_WEEK value FROM vdados
UNION ALL
SELECT   'Growth WEEK in %' lbl, Growth_WEEK_in_perc value FROM vdados ;