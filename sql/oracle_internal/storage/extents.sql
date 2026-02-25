SELECT 
    owner as "OWNER",
    segment_name as "SEGMENT_NAME",
    segment_type as "SEGMENT_TYPE",
    extent_id as "EXTENT_ID",
    file_id as "FILE_ID",
    block_id as "BLOCK_ID",
    blocks as "BLOCKS",
    bytes / 1024 as "SIZE_KB",
    relative_fno as "RELATIVE_FNO"
FROM DBA_EXTENTS
WHERE owner = :owner
  AND segment_name = :segment_name
ORDER BY extent_id
