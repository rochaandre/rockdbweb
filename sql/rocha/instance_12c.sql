@save_sqlplus_settings

col host_name format a30
COLUMN load  ON FORMAT   990D999

select gi.INSTANCE_NAME, gi.HOST_NAME, gi.status, gi.VERSION, gi.STARTUP_TIME, gi.ARCHIVER, gi.LOGINS, go.value LOAD,
gi.INSTANCE_MODE                  ,
gi.EDITION                        ,
gi.DATABASE_TYPE                  
from v$instance gi, v$osstat go
where go.stat_name='LOAD'
/



@restore_sqlplus_settings


