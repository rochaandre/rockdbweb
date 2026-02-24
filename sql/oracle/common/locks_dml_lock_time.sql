-- | PURPOSE  : Query all DML locks in the database (INSERT, UPDATE, DELETE)    |
-- |            and the number of minutes they have been holding the lock.      |
-- |            This script will also query critical information about the lock |
-- |            including Lock Type, Object Name/Owner, OS/Oracle User and Wait |
-- |            time (in minutes).                                              |
-- | NOTE     : As with any code, ensure to test this script in a development   |
-- |            environment before attempting to run it in production.          |
-- +----------------------------------------------------------------------------+

SELECT
    s.username                                 oracle_user
  , l.sid || '/' || s.serial#                  usercode
  , s.osuser                                   os_user
  , s.program                                  program
  , DECODE(l.lmode,
       1, NULL,
       2, 'Row Share',
       3, 'Row Exclusive',
       4, 'Share',
       5, 'Share Row Exclusive',
       6, 'Exclusive', 'None')                 mode_held
  , DECODE(l.request,
       1, NULL,
       2, 'Row Share',
       3, 'Row Exclusive',
       4, 'Share',
       5, 'Share Row Exclusive',
       6, 'Exclusive', 'None')                 mode_requested
  , DECODE(l.type,
       'MR', 'Media Recovery',
       'RT', 'Redo Thread',
       'UN', 'User Name',
       'TX', 'Transaction',
       'TM', 'DML',
       'UL', 'PL/SQL User Lock',
       'DX', 'Distributed Xaction',
       'CF', 'Control File',
       'IS', 'Instance State',
       'FS', 'File Set',
       'IR', 'Instance Recovery',
       'ST', 'Disk Space Transaction',
       'TS', 'Temp Segment',
       'IV', 'Library Cache Invalidation',
       'LS', 'Log Start or Log Switch',
       'RW', 'Row Wait',
       'SQ', 'Sequence Number',
       'TE', 'Extend Table',
       'TT', 'Temp Table',
       l.type)                                 lock_type
  , o.owner || '.' || o.object_name 
    || ' - (' || o.object_type || ')'          object_name
  , ROUND(l.ctime/60, 2)                       lock_time_min
FROM
    v$session     s
  , v$lock        l
  , dba_objects   o
  , dba_tables    t
WHERE
      l.id1            =  o.object_id 
  AND s.sid            =  l.sid
  AND o.owner          =  t.owner
  AND o.object_name    =  t.table_name
  AND o.owner          <> 'SYS'
  AND l.type           =  'TM'
  AND s.sid = $SID
ORDER BY
  1