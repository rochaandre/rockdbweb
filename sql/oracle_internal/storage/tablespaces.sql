SELECT 
    t.tablespace_name,
    t.status,
    t.contents,
    df.total_mb,
    (df.total_mb - nvl(fs.free_mb, 0)) as used_mb,
    nvl(fs.free_mb, 0) as free_mb,
    CASE WHEN df.total_mb > 0 THEN ROUND((df.total_mb - nvl(fs.free_mb, 0)) / df.total_mb * 100, 2) ELSE 0 END as used_pct, :inst_id as inst_id
FROM gv$tablespace d, dba_tablespaces t
JOIN (
    SELECT tablespace_name, SUM(bytes)/1024/1024 as total_mb 
    FROM dba_data_files GROUP BY tablespace_name
    UNION ALL
    SELECT tablespace_name, SUM(bytes)/1024/1024 as total_mb 
    FROM dba_temp_files GROUP BY tablespace_name
) df ON t.tablespace_name = df.tablespace_name
LEFT JOIN (
    SELECT tablespace_name, SUM(bytes)/1024/1024 as free_mb 
    FROM dba_free_space GROUP BY tablespace_name
) fs ON t.tablespace_name = fs.tablespace_name
where d.inst_id = nvl(:inst_id, d.inst_id)
and d.name = t.tablespace_name
ORDER BY t.tablespace_name
