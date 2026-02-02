SELECT inst_id, DBID,  to_char(created,'DD/MM/YYYY HH24:MI') created, log_mode, open_resetlogs,
open_mode, PROTECTION_MODE ,PROTECTION_LEVEL , SWITCHOVER_STATUS ,
FORCE_LOGGING ,FLASHBACK_ON , DB_UNIQUE_NAME
from gv$database ;

SELECT inst_id, DBID,  to_char(created,'DD/MM/YYYY HH24:MI') created, log_mode, open_resetlogs,
open_mode, PROTECTION_MODE ,PROTECTION_LEVEL , SWITCHOVER_STATUS , FORCE_LOGGING ,FLASHBACK_ON , DB_UNIQUE_NAME ,
cdb, con_id, CON_DBID from gv$database ;


dbopen AS (select  d.force_logging,  d.db_unique_name,d.name, d.database_role,d.platform_name, d.open_mode, v.version db_version,
substr(p.value,1,15) db_compatible, v.status db_status, d.log_mode,
d.inst_id, d.DBID,  to_char(d.created,'DD/MM/YYYY HH24:MI') created,  d.open_resetlogs,
  d.PROTECTION_MODE ,d.PROTECTION_LEVEL , d.SWITCHOVER_STATUS ,
d.FORCE_LOGGING ,d.FLASHBACK_ON , d.DB_UNIQUE_NAME
from gv$database d, gv$instance v, gv$parameter p
where p.name = 'compatible'
and d.inst_id=v.inst_id and v.inst_id = p.inst_id
),

inst AS (select  INSTANCE_ROLE,host_name,instance_name,   version db_version, status, to_char(startup_time,'DD-MON-YYYY HH24:MI ') Startuptime,logins
from v$instance a),
dbdetails AS (SELECT d.inst_id, d.DBID,  to_char(d.created,'DD/MM/YYYY HH24:MI') created,  d.open_resetlogs,
  d.PROTECTION_MODE ,d.PROTECTION_LEVEL , d.SWITCHOVER_STATUS ,
d.FORCE_LOGGING ,d.FLASHBACK_ON , d.DB_UNIQUE_NAME
from gv$database )


