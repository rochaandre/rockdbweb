SELECT 
    owner,
    segment_name,
    segment_type,
    tablespace_name,
    bytes / 1024 / 1024 as size_mb,
    blocks,
    extents,
    initial_extent / 1024 as initial_kb,
    next_extent / 1024 as next_kb,
    min_extents,
    max_extents
FROM dba_segments
WHERE (:ts_name IS NULL OR tablespace_name = :ts_name)
  AND (:search_query IS NULL OR segment_name LIKE '%' || UPPER(:search_query) || '%' OR owner LIKE '%' || UPPER(:search_query) || '%')
ORDER BY bytes DESC
FETCH FIRST 100 ROWS ONLY
