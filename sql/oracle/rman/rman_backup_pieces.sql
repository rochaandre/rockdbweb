SELECT
    bs.recid                                              bs_key
  , DECODE(backup_type
           , 'L', 'Archived Logs'
           , 'D', 'Datafile Full'
           , 'I', 'Incremental')                          backup_type
  , device_type                                           device_type
  , DECODE(   bs.controlfile_included
            , 'NO', null
            , bs.controlfile_included)                    controlfile_included
  , sp.spfile_included                                    spfile_included
  , bs.incremental_level                                  incremental_level
  , bs.pieces                                             pieces
  , TO_CHAR(bs.start_time, 'mm/dd/yy HH24:MI:SS')         start_time
  , TO_CHAR(bs.completion_time, 'mm/dd/yy HH24:MI:SS')    completion_time
  , bs.elapsed_seconds                                    elapsed_seconds
  , bp.tag                                                tag
  , bs.block_size                                         block_size
FROM
    v$backup_set                           bs
  , (select distinct
         set_stamp
       , set_count
       , tag
       , device_type
     from v$backup_piece
     where status in ('A', 'X'))           bp
 ,  (select distinct
         set_stamp
       , set_count
       , 'YES'     spfile_included
     from v$backup_spfile)                 sp
WHERE
      bs.set_stamp = bp.set_stamp
  AND bs.set_count = bp.set_count
  AND bs.set_stamp = sp.set_stamp (+)
  AND bs.set_count = sp.set_count (+)
ORDER BY
    bs.recid