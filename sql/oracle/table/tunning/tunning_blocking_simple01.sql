SELECT  (SELECT username FROM v$session WHERE sid=a.sid) blocker,
        a.sid, ' is blocking ' blocking,
        (SELECT username FROM v$session WHERE sid=b.sid) blockee,
        b.sid sid_locked
  FROM  gv$lock a, gv$lock b
 WHERE  a.block         =       1
   AND  b.request       >       0
   AND  a.id1           =       b.id1
   AND  a.id2           =       b.id2
ORDER BY a.sid ;