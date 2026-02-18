-- Find long running queries with v$session longops with percentage of completion

-- Find the SQL text for long running queries:

col sql_text format a100
set linesize 400
SELECT l.sid, l.start_time, l.username, l.elapsed_seconds, a.sql_text, a.elapsed_time
FROM v$session_longops l, v$sqlarea a 
WHERE a.sql_id = l.sql_id
AND l.elapsed_seconds > 1

-- Check long running process for particular session and SID

select * from (
select opname, target, sofar, totalwork,
units, elapsed_seconds, message
from v$session_longops
where sid = $SID and serial# = $SERIAL
order by start_time desc)
where rownum <=1;

-- Note:
-- Sofar Column: Work already done
-- Elapsed Seconds Column: already spent seconds for work

-- Check the time remaining for the process with session longops view

SELECT opname, target, ROUND((sofar/totalwork),4)*100 Percentage_Complete, start_time, 
CEIL(time_remaining/60) Max_Time_Remaining_In_Min, FLOOR(elapsed_seconds/60) Time_Spent_In_Min 
FROM v$session_longops 
WHERE sofar != totalwork
and sid = $SID and serial# = $SERIAL;


-- Find the SID from the PID in Oracle database

col sid format 999999
col username format a20
col osuser format a15
select b.spid,a.sid, a.serial#,a.username, a.osuser
from v$session a, v$process b
where a.paddr= b.addr
and b.spid='$SPID'
order by b.spid;

-- Get Username, status and serial# on bases of SID from session view

select sid,serial#,USERNAME,status from v$session where sid = $SID;

-- Get active session details

SELECT USERname,terminal,SID,SERIAL#,SQL_TEXT, V$session.module
FROM V$SESSION, V$SQL
WHERE V$SESSION.SQL_ADDRESS = V$SQL.ADDRESS
AND V$SESSION.STATUS = 'ACTIVE'
AND username IS NOT NULL and sid = $SID ;
-- AND SQL_TEXT not like '%XXXX%' 

-- v$session_longops gives feedback on long running queries.

 select
 -- lop.sid,
 -- lop.serial#,
    ses.osuser,
    lop.username,
    lop.opname,
    lop.target,
    lop.target_desc,
    lop.sofar,
    lop.totalwork,
    lop.time_remaining    estimated_time_remaining_sec,
    round( (sysdate - lop.start_time      ) * 24*60*60) started_s_ago,
    round( (sysdate - lop.last_update_time) * 24*60*60) updated_s_ago,
    lop.elapsed_seconds,
    lop.message,
    sql.sql_text
from
   v$session_longops lop                                      left join
   v$session         ses on lop.sid     = ses.sid      and
                            lop.serial# = ses.serial#         left join
   v$sqlarea         sql on lop.sql_id  = sql.sql_id
where sid = $SID
order by
   lop.start_time desc;

--- v$session_longops with v$sql_plan

select
   lpad(' ', 2*depth) || pln.operation                       opr,
   pln.options                                               opt,
   round(100/nullif(to_number(slo.target), 0)*slo.sofar)     pct,
   slo.target                                                tgt,
   slo.sofar,
   slo.totalwork,
   slo.units,
   round((sysdate - slo.start_time       ) * 24 * 60) sta_m_ago,
   round((sysdate - slo.last_update_time ) * 24 * 60) upd_m_ago,
   slo.message,
   ses.state,
   ses.status  
-- pln.*,
-- slo.*
from
   v$session         ses                                                     left join
   v$sql_plan        pln  on ses.sql_address    = pln.address          and 
                             ses.sql_hash_value = pln.hash_value             left join
   v$session_longops slo  on pln.address        = slo.sql_address      and
                             pln.hash_value     = slo.sql_hash_value   and
                             pln.id             = slo.sql_plan_line_id and
                             ses.sid            = slo.sid              and
                             ses.serial#        = slo.serial#
where ses.sid = $SID
order by
   pln.id;   