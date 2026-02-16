SELECT 
owner,   object_name,  object_type,
      table_name, meg,
          tablespace_name 
FROM (
  SELECT
    b.owner, b.object_name, b.object_type, b.table_name, ROUND(b.bytes)/1024/1024 AS meg,
    b.tablespace_name, nvl( b.compression, a.compression)  compression,  a.compress_for, extents, b.initial_extent,
    ROUND(Sum(b.bytes/1024/1024) OVER (PARTITION BY b.table_name)) AS total_table_meg
  FROM dba_tables a, (
    -- Tables
    SELECT owner, segment_name AS object_name, 'TABLE' AS object_type,
          segment_name AS table_name, bytes,
          tablespace_name, extents, initial_extent,null compression,null  compress_for
    FROM   dba_segments
    WHERE  segment_type IN ('TABLE', 'TABLE PARTITION', 'TABLE SUBPARTITION')
   -- and owner=P_SCHEMA
    UNION ALL
    -- Indexes
    SELECT i.owner, i.index_name AS object_name, 'INDEX' AS object_type,
          i.table_name, s.bytes,
          s.tablespace_name, s.extents, s.initial_extent,i.compression,null  compress_for
    FROM   dba_indexes i, dba_segments s
    WHERE  s.segment_name = i.index_name
    -- and    s.owner='SANKHYA'
    AND    s.owner = i.owner
    AND    s.segment_type IN ('INDEX', 'INDEX PARTITION', 'INDEX SUBPARTITION')
    -- LOB Segments
    UNION ALL
    SELECT l.owner, l.column_name AS object_name, 'LOB_COLUMN' AS object_type,
          l.table_name, s.bytes,
          s.tablespace_name, s.extents, s.initial_extent,l.compression,null  compress_for
    FROM   dba_lobs l, dba_segments s
    WHERE  s.segment_name = l.segment_name
   -- and    s.owner=P_SCHEMA
    AND    s.owner = l.owner
    AND    s.segment_type = 'LOBSEGMENT'
    -- LOB Indexes
    UNION ALL
    SELECT l.owner, l.column_name AS object_name, 'LOB_INDEX' AS object_type,
          l.table_name, s.bytes,
          s.tablespace_name, s.extents, s.initial_extent,l.compression,null  compress_for
    FROM   dba_lobs l, dba_segments s
    WHERE  s.segment_name = l.index_name
    -- and    s.owner=P_SCHEMA
    AND    s.owner = l.owner
    AND    s.segment_type = 'LOBINDEX'
  ) b
  WHERE 1=1 -- b.owner in UPPER(P_SCHEMA)
 and a.owner= b.owner (+)
 and a.table_name = b.table_name (+)
 -- and b.table_name = nvl(p_table,b.table_name)
)
WHERE total_table_meg > 10
ORDER BY total_table_meg DESC, meg DESC ;