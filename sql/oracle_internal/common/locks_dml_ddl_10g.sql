-- | PURPOSE  : Query all DML and DDL locks in the database. This script will   |
-- |            query critical information about the lock including Lock Type,  |
-- |            Object Name/Owner, OS/Oracle User and Wait time (in minutes).   |
-- | NOTE     : As with any code, ensure to test this script in a development   |
-- |            environment before attempting to run it in production.          |
-- +----------------------------------------------------------------------------+

SELECT 
    a.osuser || ':' || a.username   UserID
  , a.sid || '/' || a.serial#       usercode
  , b.lock_type Type, b.mode_held   Hold
  , c.owner || '.' || c.object_name Object
  , a.program                       Program 
  , d.seconds_in_wait   WaitSec
FROM 
    v$session       a
  , dba_locks   b
  , sys.dba_objects c
  , v$session_wait  d
WHERE 
      a.sid        =  b.session_id
  AND b.lock_type  IN ('DML','DDL')
  AND b.lock_id1   =  c.object_id
  AND b.session_id  =  d.sid
  AND a.sid = $SID
