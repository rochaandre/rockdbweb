SELECT inst_id, DBID,  to_char(created,'DD/MM/YYYY HH24:MI') created, log_mode, open_resetlogs,
open_mode, PROTECTION_MODE ,PROTECTION_LEVEL , SWITCHOVER_STATUS ,
FORCE_LOGGING ,FLASHBACK_ON , DB_UNIQUE_NAME ,
cdb, con_id, CON_DBID
from gv$database ;