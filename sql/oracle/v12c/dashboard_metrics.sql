-- Query 1: Summary Metrics
SELECT count(*) as total FROM v$session;
SELECT count(*) as active FROM v$session WHERE status = 'ACTIVE' AND type != 'BACKGROUND';

-- Query 2: SGA Info
SELECT name, bytes FROM v$sgainfo UNION ALL SELECT 'Total SGA size' as name, sum(bytes) FROM v$sgainfo;

-- Query 3: Object Status
SELECT status, count(*) as count
FROM dba_objects 
WHERE owner NOT IN ('SYS', 'SYSTEM', 'DBSNMP', 'OUTLN') 
GROUP BY status;
SELECT count(*) FROM dba_objects WHERE status != 'VALID';

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

-- Query 9: CDB/PDB Details
SELECT v.instance_name as db_name, decode(d.cdb, 'YES', 1, 0) as is_cdb FROM v$database d, v$instance v;
SELECT sys_context('USERENV', 'CON_NAME') FROM dual;
-- Query 10: Top Segments in Buffer Cache
SELECT * FROM (
    SELECT owner, object_name, object_type, count(*) as blocks
    FROM v$bh bh
    JOIN dba_objects o ON bh.objd = o.data_object_id
    GROUP BY owner, object_name, object_type
    ORDER BY blocks DESC
) WHERE rownum <= 5;
