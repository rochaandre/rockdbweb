SELECT 
    owner || '.' || segment_name as name,
    round(bytes / 1024 / 1024, 2) as value
FROM dba_segments
WHERE tablespace_name = :ts
ORDER BY bytes DESC
FETCH FIRST 10 ROWS ONLY
