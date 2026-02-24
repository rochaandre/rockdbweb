SELECT 
    df.tablespace_name,
    ROUND(df.bytes / 1024 / 1024, 2) as total_mb,
    ROUND((df.bytes - nvl(fs.bytes, 0)) / 1024 / 1024, 2) as used_mb,
    ROUND(nvl(fs.bytes, 0) / 1024 / 1024, 2) as free_mb,
    ROUND((df.bytes - nvl(fs.bytes, 0)) / df.bytes * 100, 2) as used_pct
FROM 
    (SELECT tablespace_name, SUM(bytes) bytes FROM dba_data_files GROUP BY tablespace_name) df
    LEFT JOIN (SELECT tablespace_name, SUM(bytes) bytes FROM dba_free_space GROUP BY tablespace_name) fs
    ON df.tablespace_name = fs.tablespace_name
ORDER BY used_pct DESC
