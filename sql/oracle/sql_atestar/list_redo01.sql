select 'PRIMY' redo, group# "Group", substr(STATUS,1,9) "Status", bytes/1024/1024 mb, thread# thread
from gv$log 
union all
select 'STDBY' redo, group#, substr(STATUS,1,9) "Status", bytes/1024/1024 mb, thread#
from v$standby_log   
order by redo, thread, "Group" ;

