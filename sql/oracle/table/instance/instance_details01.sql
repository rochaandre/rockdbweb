select inst_id, version, status, logins, edition, database_type, host_name,instance_name,  to_char(startup_time,
'DD-MON-YYYY HH24:MI ') "Startup time",
decode(instance_name,(select instance_name from v$instance) ,'CURRENT','NOT CURRENT') CONNECTED
from gv$instance
order by 1 ;