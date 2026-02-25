SELECT 
    'USED' as status,
    owner,
    segment_name,
    partition_name,
    segment_type,
    file_id,
    block_id,
    blocks,
    bytes / 1024 as size_kb,
    relative_fno
FROM dba_extents
WHERE tablespace_name = :ts_name
  AND (:file_id IS NULL OR file_id = :file_id)
UNION ALL
SELECT 
    'FREE' as status,
    NULL as owner,
    NULL as segment_name,
    NULL as partition_name,
    NULL as segment_type,
    file_id,
    block_id,
    blocks,
    bytes / 1024 as size_kb,
    relative_fno
FROM dba_free_space
WHERE tablespace_name = :ts_name
  AND (:file_id IS NULL OR file_id = :file_id)
ORDER BY file_id, block_id
FETCH FIRST 2000 ROWS ONLY
