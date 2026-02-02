WITH
LAG AS (
select name, value|| time_computed value
from v$dataguard_stats
),
APPLIED AS
(SELECT 'SEQUENCE: '|| MAX(SEQUENCE#) NAME , THREAD#||' - '|| APPLIED VALUE
FROM V$ARCHIVED_LOG GROUP BY THREAD#, APPLIED),
CHECKSYNCH as
(SELECT 'THREAD: '||ARCH.THREAD# ||' '|| ARCH.SEQUENCE# name , 'Last Sequence Received: '||' '|| APPL.SEQUENCE# ||' '||'Last Sequence Applied: '||' '||
(ARCH.SEQUENCE# - APPL.SEQUENCE#) value
FROM (SELECT THREAD# ,SEQUENCE# FROM V$ARCHIVED_LOG WHERE (THREAD#,FIRST_TIME )
IN (SELECT THREAD#,MAX(FIRST_TIME) FROM V$ARCHIVED_LOG GROUP BY THREAD#)) ARCH,
(SELECT THREAD# ,SEQUENCE# FROM V$LOG_HISTORY WHERE (THREAD#,FIRST_TIME ) IN
(SELECT THREAD#,MAX(FIRST_TIME)
FROM V$LOG_HISTORY GROUP BY THREAD#)) APPL
WHERE ARCH.THREAD# = APPL.THREAD#
ORDER BY 1)
,APPLIED AS
(SELECT 'SEQUENCE: '|| MAX(SEQUENCE#) NAME , THREAD#||' - '|| APPLIED VALUE
FROM V$ARCHIVED_LOG GROUP BY THREAD#, APPLIED),
PRIMARYCREATEDXAPPLIED as
(SELECT 'resetlogs_id: '|| a.resetlogs_id ||' HOST: '|| DECODE (a.thread#, 1, 'node1', 'node2')  ||' SEQ: '||b.last_seq  NAME,
'LAST APPLIED: ' ||' '|| a.applied_seq  ||' '|| TO_CHAR (a.last_applied_time, 'dd/mm/yyyy hh24:mi:ss') VALUE
FROM (SELECT resetlogs_id, thread#, MAX (sequence#) applied_seq, MAX (next_time) last_applied_time
FROM gv$archived_log
WHERE applied = 'YES' and resetlogs_id=(select max(resetlogs_id) from gv$archived_log)
GROUP BY resetlogs_id, thread# ) a,
(SELECT resetlogs_id, thread#, MAX (sequence#) last_seq
FROM gv$archived_log where resetlogs_id=(select max(resetlogs_id) from gv$archived_log)
GROUP BY resetlogs_id, thread# ) b
WHERE a.thread# = b.thread#) ,
line as
(SELECT '-----------------------------------------------------' NAME, '------------------------------------------------------------------'VALUE
FROM DUAL),
dataguard_alert as
(select to_char(timestamp, 'dd/mm/yyyy hh24:mi:ss') name, facility|| ' '|| message value
from v$DATAGUARD_STATUS
where timestamp >= sysdate - 1/24
ORDER BY 1),
transport as
(select process ||' ' ||status ||' ' || group# name,  thread# ||' ' ||sequence#  ||' '  value
from v$managed_standby)
SELECT *
FROM LINE
UNION ALL
SELECT '| STEP 01                           ' NAME,
'CHECK LAG                                                        |' VALUE
FROM DUAL
UNION ALL
SELECT *
FROM LINE
UNION  ALL
select NAME, VALUE
from lag
UNION ALL
SELECT *
FROM LINE
UNION ALL
SELECT '| STEP 02                 ' NAME,
'CHECK APPLIED SEQUENCE                                           |'VALUE
FROM DUAL
UNION ALL
SELECT *
FROM LINE
UNION  ALL
select NAME, VALUE
from APPLIED
UNION ALL
SELECT *
FROM LINE
UNION ALL
SELECT '| STEP 03                 ' NAME,
'PRIMARY CREATED X STANDBY APPLIED                                |' VALUE
FROM DUAL
UNION ALL
SELECT *
FROM LINE
UNION  ALL
select NAME, VALUE
from PRIMARYCREATEDXAPPLIED
UNION ALL
SELECT *
FROM LINE
UNION ALL
SELECT '| STEP 04                 ' NAME,
'logs                                                             |' VALUE
FROM DUAL
UNION ALL
SELECT *
FROM LINE
UNION  ALL
select NAME, VALUE
from dataguard_alert
UNION ALL
SELECT *
FROM LINE
UNION ALL
SELECT '| STEP 05                 ' NAME,
'Transport                                                        |' VALUE
FROM DUAL
UNION ALL
select NAME, VALUE
from transport
UNION ALL
SELECT *
FROM LINE
UNION ALL
SELECT '| STEP 06                 ' NAME,
'Check sync                                                       |' VALUE
FROM DUAL
UNION ALL
SELECT *
FROM LINE
UNION ALL
select NAME, VALUE
from CHECKSYNCH
UNION ALL
SELECT *
FROM LINE
UNION ALL
SELECT '| STEP 07                 ' NAME,
'Check Error                                                      |' VALUE
FROM DUAL
UNION ALL
SELECT *
FROM LINE
UNION ALL
select 'DEST_ID: '|| dest_id||' STATUS '|| status||' DESTINATION '|| destination name, '  '||error value from v$archive_dest where dest_id between 2 and 4
