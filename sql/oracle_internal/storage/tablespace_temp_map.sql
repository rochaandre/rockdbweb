SELECT 
    'USED' as STATUS,
    NULL as OWNER,
    'TEMP_SEGMENT' as SEGMENT_NAME,
    NULL as PARTITION_NAME,
    'TEMPORARY' as SEGMENT_TYPE,
    FILE_ID,
    ROWNUM as BLOCK_ID,
    BLOCKS_USED as BLOCKS,
    BYTES_USED / 1024 as SIZE_KB,
    RELATIVE_FNO
FROM v$temp_extent_pool
WHERE tablespace_name = :ts_name AND blocks_used > 0
AND (:file_id IS NULL OR file_id = :file_id)
UNION ALL
SELECT 
    'FREE' as STATUS,
    NULL as OWNER,
    NULL as SEGMENT_NAME,
    NULL as PARTITION_NAME,
    NULL as SEGMENT_TYPE,
    FILE_ID,
    (99999 + ROWNUM) as BLOCK_ID,
    (BLOCKS_CACHED - BLOCKS_USED) as BLOCKS,
    (BYTES_CACHED - BYTES_USED) / 1024 as SIZE_KB,
    RELATIVE_FNO
FROM v$temp_extent_pool
WHERE tablespace_name = :ts_name
AND (:file_id IS NULL OR file_id = :file_id)