select rownum as rank, a.*
from (SELECT v.sid,sess.Serial# serial,program, trunc(v.value / (100 * 60),3) CPUMins
FROM v$statname s , v$sesstat v, v$session sess
WHERE s.name = 'CPU used by this session'
and sess.sid = v.sid
and v.statistic#=s.statistic#
and v.value>0
ORDER BY v.value DESC) a
where rownum < 11 ;