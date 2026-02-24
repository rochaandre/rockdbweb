-- Query 1: Summary Metrics
SELECT count(*) as total FROM v$session;
SELECT count(*) as active FROM v$session WHERE status = 'ACTIVE' AND type != 'BACKGROUND';

-- Query 2: SGA Info
SELECT name, bytes FROM v$sgainfo;

-- Query 3: Object Status
SELECT status, count(*) as count
FROM dba_objects 
WHERE owner NOT IN ('SYS', 'SYSTEM', 'DBSNMP', 'OUTLN') 
GROUP BY status;

-- Query 4: Open Cursors
SELECT sum(a.value) as value, b.name 
FROM v$sesstat a, v$statname b 
WHERE a.statistic# = b.statistic# AND b.name = 'opened cursors current' 
GROUP BY b.name;

-- Query 5: Triggers Status (Object status)
SELECT o.status, count(*) as count
FROM dba_triggers t
JOIN dba_objects o ON t.owner = o.owner AND t.trigger_name = o.object_name
WHERE o.object_type = 'TRIGGER'
GROUP BY o.status;

-- Query 6: Long Operations
SELECT count(*) as count FROM v$session_longops WHERE sofar < totalwork;

-- Query 7: SYSAUX Occupants
SELECT count(*) as count FROM v$sysaux_occupants;

-- Query 8: RAC Details
SELECT value FROM v$parameter WHERE name = 'cluster_database';
SELECT count(*) FROM v$instance;

-- Query 9: CDB/PDB Details (11g Fallback)
SELECT 'NO' FROM dual;
SELECT 'NON-CDB' FROM dual;
