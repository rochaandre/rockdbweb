-- Invalid DB objects
SELECT owner, object_name, object_type, status, last_ddl_time
FROM dba_objects 
WHERE status != 'VALID'
ORDER BY owner, object_type;
