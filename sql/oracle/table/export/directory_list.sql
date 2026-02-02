SELECT a.owner,a.directory_name, a.directory_path , created
FROM DBA_OBJECTS b, dba_directories a
WHERE a.owner = b.owner
AND a.directory_name = b.object_name
ORDER BY created ;