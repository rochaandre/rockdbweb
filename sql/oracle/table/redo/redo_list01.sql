  SELECT l.thread# thread,
         lf.group# group1,
         lf.member,
         TRUNC(l.bytes/1024/1024) AS size_mb,
         l.status,
         l.archived,
         lf.type,
         l.sequence#  sequence
  FROM   v$logfile lf
         JOIN v$log l ON l.group# = lf.group#
  ORDER BY l.thread#,lf.group#, lf.MEMBER ;