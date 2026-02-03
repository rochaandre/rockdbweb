SELECT bs.recid, sp.spfile_included spfile
  , TO_CHAR(bs.completion_time, 'dd/mm/yyyy HH24:MI:SS') completion_time
  , DECODE(status, 'A', 'Available', 'D', 'Deleted', 'X', 'Expired') status, handle
  FROM v$backup_set  bs, v$backup_piece  bp, (select distinct set_stamp, set_count, 'YES' spfile_included
   from v$backup_spfile) sp
  WHERE bs.set_stamp = bp.set_stamp
    AND bs.completion_time > sysdate -1
    AND bs.set_count = bp.set_count
    AND bp.status IN ('A', 'X')
    AND bs.set_stamp = sp.set_stamp
    AND bs.set_count = sp.set_count
  ORDER BY  bs.completion_time desc, bs.recid, piece# ;