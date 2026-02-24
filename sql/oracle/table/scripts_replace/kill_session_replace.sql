
-- Check the Status of the Transaction
-- Make sure the session is active before killing the SQL:
SELECT s.sid,
       s.serial#,
       s.username,
       t.start_time,
       t.status AS txn_status
FROM   gv$transaction t
JOIN   gv$session s
ON     t.addr = s.taddr
WHERE  s.sql_id = '$SQL_ID';
-- ACTIVE → Currently running transaction
-- INACTIVE → Idle, but holding locks

-- Find Blocking Sessions	
SELECT * FROM gv$session WHERE blocking_session IS NOT NULL;

-- Check SQL Text	
SELECT sql_text FROM gv$sql WHERE sql_id='$SQL_ID';

-- Cancel SQL	
ALTER SYSTEM CANCEL SQL '$SQL_ID';

-- Cancel SQL with SID/SERIAL#	
ALTER SYSTEM CANCEL SQL '$SQL_ID,$SID,$SERIAL#';

-- Kill Session	
ALTER SYSTEM KILL SESSION '$SID,$SERIAL';

-- Kill Session Immediate	
ALTER SYSTEM KILL SESSION '$SID,$SERIAL' IMMEDIATE;
ALTER SYSTEM KILL SESSION '$SID,$SERIAL,@$INST_ID' IMMEDIATE;

-- Cancel (Kill) Only the SQL Statement
ALTER SYSTEM CANCEL SQL '$SQL_ID';

-- Cancel Using SID & SERIAL#
ALTER SYSTEM CANCEL SQL '$SQL_ID,$SID,$SERIAL';

-- Check Remaining Blockers	
SELECT * FROM v$session WHERE blocking_session IS NOT NULL;

-- Verify if the SQL is Killed
SELECT sid,
       serial#,
       status,
       sql_id
FROM v$session
WHERE sid = $SID;


-- All blocked sessions
SELECT inst_id, sid, serial#, username, blocking_session, sql_id, status,
'ALTER SYSTEM KILL SESSION '||''''||'$SID,$SERIAL,@$INST_ID'||''''||' IMMEDIATE ' AS kill_command
FROM gv$session
WHERE blocking_session IS NOT NULL;



-- Check Transaction Status	
select 
  trx.addr,
  ses.taddr,  
  trx.ses_addr,
  ses.saddr,
  case when       trx.addr != ses.taddr then 'trx.addr != ses.taddr' end cmp_taddr
from
  v$transaction      trx                             left join
  v$session          ses on trx.ses_addr = ses.saddr
WHERE ses.sid = $SID;

-- Check Transaction Status	SQL AREA
select /*+ ordered */
  round( (sysdate - to_date(trx.start_time, 'mm/dd/yy hh24:mi:ss')) * 24 * 60, 1 ) start_minutes_ago,
  trx.log_io         logical_io,
  trx.phy_io         physical_io,
  trx.cr_get         consistent_gets,
  trx.cr_change      consistent_changes,
  --
  trx.used_urec      undo_records_used,
  trx.used_ublk      undo_blocks_used,
  --
  ses.osuser,
  ses.username,
  --
  sql.sql_text,
  --
  trx.xidusn         undo_segment_number,
  trx.xidslot        slot_number,
  trx.xidsqn         sequence_number,
  --
  trx.ubafil         undo_block_address_filenum,
  trx.ubablk         uba_block_number,
  trx.ubasqn         uba_block_sequence,
  trx.ubarec         uba_record_number,
  trx.status,
  trx.start_scnb     system_change_number,
  trx.start_scnw     scn_wrap,
  trx.start_uext     start_extent_number,
  trx.start_ubafil   start_ubafile,
  trx.start_ubablk   start_uba_block,
  trx.start_ubasqn   start_uba_sequence_number,
  trx.start_ubarec   start_uba_record_nubmer,
--trx.ses_addr       session_address,
  trx.ptx            parallel_transaction
from
  v$transaction  trx                                      join
  v$session      ses on trx.ses_addr = ses.saddr     left join
  v$sqlarea      sql on ses.sql_id   = sql.sql_id
--where
--  trx.addr = '00000049DE4C7D98'
WHERE ses.sid = $SID
order by
  to_date(trx.start_time, 'mm/dd/yy hh24:mi:ss')

-- Check Transaction Status	SESSION

select
   ses.sid, 
   ses.username,
   rlb.name          "Rollback segment name", 
   trx.start_date    "TRX start date",
   trx.used_ublk     "Undo blocks",
   trx.used_urec     "Undo recs"
from
   v$session     ses                          join
   v$transaction trx on ses.taddr  = trx.addr join
   v$rollname    rlb on trx.xidusn = rlb.usn
WHERE ses.sid = $SID;

-- Check Transaction ID
select
    xidusn   undo_segement_number,
    xidslot  slot_number,
    xidsqn   sequence_number,
    xid
from
    v$transaction;

-- Show hierachical mode for all locks
WITH session_tree AS (
  SELECT 
    LEVEL lvl,
    sid,
    blocking_session,
    username,
    sql_id,
    event,
    seconds_in_wait,
    LPAD(' ', (LEVEL - 1) * 2) || sid AS session_tree
  FROM v$session
  WHERE sid IN (
    SELECT blocking_session FROM v$session
    UNION
    SELECT sid FROM v$session WHERE blocking_session IS NOT NULL
  )
  CONNECT BY PRIOR sid = blocking_session
  START WITH blocking_session IS NULL
)
SELECT session_tree, username, sql_id, event, seconds_in_wait
FROM session_tree
ORDER BY lvl;       


SELECT DECODE(request,0,'Holder: ','Waiter: ') || sid sess,
  id1,
  id2,
  lmode,
  request,
  type
FROM v$lock
WHERE (id1, id2, type) IN
  (SELECT id1, id2, type FROM v$lock WHERE request > 0
  )
ORDER BY id1,
  request;

-- Find Blocked Sessions
select s1.username || '@' || s1.machine
 || ' ( SID=' || s1.sid || ' ) is blocking '
 || s2.username || '@' || s2.machine 
 || ' ( SID=' || s2.sid || ' ) ' AS blocking_status
 from v$lock l1, v$session s1, v$lock l2, v$session s2
 where s1.sid=l1.sid and s2.sid=l2.sid
 and l1.BLOCK=1 and l2.request > 0
 and l1.id1 = l2.id1
 and l2.id2 = l2.id2 ;


-- Find Blocked SQL

SELECT SES.SID, SES.SERIAL# SER#, SES.PROCESS OS_ID, SES.STATUS, SQL.SQL_FULLTEXT
FROM V$SESSION SES, V$SQL SQL, V$PROCESS PRC
WHERE
   SES.SQL_ID=SQL.SQL_ID AND
   SES.SQL_HASH_VALUE=SQL.HASH_VALUE AND 
   SES.PADDR=PRC.ADDR AND
   SES.SID=$SID;

-- Find Lock Wait Time
SELECT 
  blocking_session "BLOCKING_SESSION",
  sid "BLOCKED_SESSION",
  serial# "BLOCKED_SERIAL#", 
  seconds_in_wait/60 "WAIT_TIME(MINUTES)"
FROM v$session
WHERE blocking_session is not NULL
and sid=$SID
ORDER BY blocking_session;


-- Show locked table

select lo.session_id,lo.oracle_username,lo.os_user_name,
lo.process,do.object_name,do.owner,
decode(lo.locked_mode,0, 'None',1, 'Null',2, 'Row Share (SS)',
3, 'Row Excl (SX)',4, 'Share',5, 'Share Row Excl (SSX)',6, 'Exclusive',
to_char(lo.locked_mode)) mode_held
from gv$locked_object lo, dba_objects do
where lo.object_id = do.object_id
order by 5
/

