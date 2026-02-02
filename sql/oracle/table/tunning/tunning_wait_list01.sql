select a.sid,b.username,substr(b.module,1,10) Module,a.event,a.p1,a.p2,a.p3,b.sql_hash_value,b.last_call_et/60 last_call_et
from v$session_wait a, v$session b
where a.event not in ('SQL*Net message from client','wakeup time manager','pipe get','PL/SQL lock timer',
'rdbms ipc message','smon timer','pmon timer','null event','jobq slave wait','queue messages','SQL*Net message to client')
and a.sid=b.sid order by b.sql_hash_value ;