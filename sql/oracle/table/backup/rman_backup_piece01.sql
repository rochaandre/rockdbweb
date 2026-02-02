   SELECT bs.recid,
  DECODE(   bp.status, 'A', 'Available', 'D', 'Deleted', 'X', 'Expired') status , bp.handle
  handle, TO_CHAR(bp.start_time, 'dd/mm/yyyy HH24:MI:SS') start_time
  , TO_CHAR(bp.completion_time, 'dd/mm/yyyy HH24:MI:SS') end_time, bp.elapsed_seconds   ELAPSED
  FROM
      v$backup_set bs JOIN v$backup_piece bp USING (set_stamp,set_count)
  WHERE
      bp.status IN ('A', 'X') AND bp.completion_time > sysdate-8
  ORDER BY bp.completion_time desc, bs.recid, bp.piece# ;