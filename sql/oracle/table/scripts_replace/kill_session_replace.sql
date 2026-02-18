
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
SELECT inst_id, sid, serial, username, blocking_session, sql_id, status, 
'ALTER SYSTEM KILL SESSION ''$SID,$SERIAL,@$INST_ID'' IMMEDIATE;' AS kill_command
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