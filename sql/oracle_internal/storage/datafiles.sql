SELECT 
    f.file_id,
    f.file_name,
    f.tablespace_name,
    f.bytes / 1024 / 1024 as size_mb,
    (f.bytes - nvl(free.bytes, 0)) / 1024 / 1024 as used_mb,
    f.status,
    f.autoextensible,
    'DATA' as type,
    nvl(io.phyrds, 0) as phyrds,
    nvl(io.phywrts, 0) as phywrts,
    nvl(io.readtim, 0) as read_time,
    nvl(io.writetim, 0) as write_time
FROM dba_data_files f
LEFT JOIN (SELECT file_id, sum(bytes) as bytes FROM dba_free_space GROUP BY file_id) free ON f.file_id = free.file_id
LEFT JOIN gv$filestat io ON f.file_id = io.file# AND (:inst_id IS NULL OR io.inst_id = :inst_id)
UNION ALL
SELECT 
    f.file_id,
    f.file_name,
    f.tablespace_name,
    f.bytes / 1024 / 1024 as size_mb,
    nvl(u.bytes, 0) / 1024 / 1024 as used_mb,
    f.status,
    f.autoextensible,
    'TEMP' as type,
    nvl(io.phyrds, 0) as phyrds,
    nvl(io.phywrts, 0) as phywrts,
    nvl(io.readtim, 0) as read_time,
    nvl(io.writetim, 0) as write_time
FROM dba_temp_files f
LEFT JOIN (SELECT file_id, sum(bytes_used) as bytes FROM v$temp_extent_pool GROUP BY file_id) u ON f.file_id = u.file_id
LEFT JOIN gv$tempstat io ON f.file_id = io.file# AND (:inst_id IS NULL OR io.inst_id = :inst_id)
ORDER BY tablespace_name, file_name
