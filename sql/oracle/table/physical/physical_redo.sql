    SELECT a.inst_id ,
    a.GROUP# groupredo,
    a.THREAD# thread,
    a.SEQUENCE# sequence,
    a.ARCHIVED,
    a.STATUS,
    b.MEMBER AS FILE_NAME,
    (a.BYTES/1024/1024) AS SIZE_MB
    FROM gv$log a
    JOIN gv$logfile b ON a.Group#=b.Group#
    where a.inst_id =  b.inst_id
    ORDER BY b.inst_id, a.GROUP# ;