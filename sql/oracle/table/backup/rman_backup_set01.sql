    SELECT  to_char(bs.recid) recid ,
    DECODE(backup_type, 'L', 'Archived Logs', 'D', 'Datafile Full', 'I', 'Incremental') backup_type,
    device_type  type , DECODE(bs.controlfile_included, 'NO', null, bs.controlfile_included) controlfile,
    sp.spfile_included spfile, bs.incremental_level L,TO_CHAR(bs.start_time, 'dd/mm/yyyy HH24:MI:SS') start_time,
    TO_CHAR(bs.completion_time, 'dd/mm/yyyy HH24:MI:SS')  end_time, bs.elapsed_seconds "ELAPSED",
    bp.tag, bs.block_size "BLOCK"
    FROM  v$backup_set  bs, (select distinct set_stamp, set_count, tag, device_type from v$backup_piece where status in ('A', 'X'))  bp,
     (select distinct set_stamp, set_count, 'YES' spfile_included from v$backup_spfile) sp
  WHERE completion_time > sysdate -1
    AND bs.set_stamp = bp.set_stamp
    AND bs.set_count = bp.set_count
    AND bs.set_stamp = sp.set_stamp (+)
    AND bs.set_count = sp.set_count (+)
  ORDER BY  completion_time desc, bs.recid ;