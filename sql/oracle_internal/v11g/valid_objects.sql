-- Valid Objects Detail
SELECT * FROM (
    SELECT owner, object_name, object_type, status, created, last_ddl_time
    FROM dba_objects
    WHERE status = 'VALID'
    AND owner LIKE :owner_filter
    AND owner NOT IN ('SYS', 'SYSTEM', 'DBSNMP', 'OUTLN')
    ORDER BY last_ddl_time DESC
) WHERE rownum <= 100
